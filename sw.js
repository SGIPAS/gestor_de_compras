self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('compras-v1').then(cache => cache.addAll([
      './',
      './index.html',
      './js/app.js',
      './js/supabase-client.js',
      './js/modules/auth.js',
      './js/modules/ordenes.js',
      './js/modules/proveedores.js',
      './js/modules/resumen.js',
      './logo.png'
    ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});