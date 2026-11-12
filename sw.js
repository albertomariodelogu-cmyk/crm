const CACHE="sales-crm-v4";
const FILES=["./","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:"reload"}).then(r=>{if(r.ok)return c.put(f,r)})))));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  const isPage=e.request.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("/index.html");
  if(isPage){
    e.respondWith(fetch(u.origin+u.pathname,{cache:"no-cache"}).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put("./",cp));}
      return r;
    }).catch(()=>caches.open(CACHE).then(c=>c.match("./")).then(r=>r||new Response("Offline",{status:503}))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request,{cache:"no-cache"}).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||(await net)||new Response("Offline",{status:503});
  }));
});
