const CACHE_NAME = 'safety-report-v2';
const ASSETS = [
  './index.html',
  './bg.png', './bg2.png', './bg3.png', './bg4.png',
  './icon-192.png', './icon-512.png', './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // supabase, cdn 요청은 항상 네트워크로 (캐시 대상 아님)
  if (e.request.url.includes('supabase.co') || e.request.url.includes('cdn')) return;

  // 앱 껍데기(HTML/이미지)는 "네트워크 우선" - 인터넷 되면 항상 최신판, 안 될 때만 캐시된 예전 버전
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
