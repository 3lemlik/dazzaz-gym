/* Al-Dzaz Gym: lets the site install as an app. Always fetches the newest copy straight from the server (skips the browser and GitHub caches), and falls back to the last copy only when offline. */
const C='dz-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;const u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(u.searchParams.has('v'))return; /* update checks go straight to the network */
  const page=r.mode==='navigate';
  const key=page?new Request(u.origin+u.pathname):r;
  const net=page?fetch(u.origin+u.pathname+'?fresh='+Date.now(),{cache:'no-store',credentials:'same-origin'}):fetch(r,{cache:'no-cache'});
  e.respondWith(net.then(res=>{if(res&&res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp)).catch(()=>{})}return res}).catch(()=>caches.match(key).then(m=>m||caches.match(u.origin+u.pathname))));
});
