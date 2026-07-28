const cacheName = 'mao-weekly-report-v6';
const appFiles = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './pinamalayan-boundary.json',
  './icons/mao-weekly-icon.svg'
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
  const requestUrl = new URL(event.request.url);
  if (event.request.mode === 'navigate' && requestUrl.pathname.endsWith('/weekly-app/index.html')) {
    event.respondWith(Response.redirect('/', 302));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});
