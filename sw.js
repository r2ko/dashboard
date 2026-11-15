const V='organisation-v4';
const FILES=['./','./index.html','./style.css','./manifest.webmanifest','./config.js','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Réponse immédiate depuis le cache, mise à jour en arrière-plan
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res})
      .catch(()=>hit||(r.mode==='navigate'?c.match('./index.html'):Response.error()));
    return hit&&!/config\.js$/.test(r.url)?hit:net; // config.js : réseau d'abord
  }));
});
