/* Still the One — offline cache for the demo app shell */
const CACHE='sto-app-v2';
const ASSETS=[
  './checkout.html',
  './date-dance.html',
  './date-film.html',
  './date-italian.html',
  './date-letters.html',
  './date-market.html',
  './date-pottery.html',
  './date-stars.html',
  './date-sunrise.html',
  './dates.html',
  './flowers.html',
  './gifts.html',
  './index.html',
  './plans.html',
  './profile.html',
  './reservations.html',
  './assets/common.css',
  './assets/app.css',
  './assets/common.js',
  './manifest.json',
  './icons/icon.svg'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{ if(res&&res.ok&&(new URL(r.url).origin===location.origin||r.url.includes('fonts.')))caches.open(CACHE).then(c=>c.put(r,res.clone())); return res;}).catch(()=>hit);
    return hit||net;
  }));
});
