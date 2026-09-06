const CACHE_NAME = 'safety-report-v1';
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
  // 앱 껍데기(HTML/이미지)는 캐시 우선, API 요청(supabase 등)은 항상 네트워크로
  if (e.request.url.includes('supabase.co') || e.request.url.includes('cdn')) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
