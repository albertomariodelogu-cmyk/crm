const CACHE="sales-crm-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=u.pathname.endsWith("/")?"./":e.request;
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(key,r.clone());return r}).catch(()=>null);
    return hit||(await net)||new Response("Offline",{status:503});
  }));
});
