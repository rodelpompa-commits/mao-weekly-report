const cacheName = 'mao-weekly-report-root-v2';
const appFiles = [
  '/',
  '/manifest.webmanifest',
  '/icons/mao-weekly-icon.svg',
  '/weekly-app/index.html',
  '/weekly-app/app.js',
  '/weekly-app/styles.css',
  '/weekly-app/manifest.webmanifest',
  '/weekly-app/pinamalayan-boundary.json',
  '/weekly-app/icons/mao-weekly-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(appFiles)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});
