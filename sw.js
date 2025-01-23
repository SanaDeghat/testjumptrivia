const version = 'v124';  // change this everytime you update the service worker
                          // to force the browser to also update it.

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/testjumptrivia/',
        '/testjumptrivia/Index.html',
        '/testjumptrivia/style.css',
        '/testjumptrivia/js2.js',
        '/testjumptrivia/images/dino.webp',
        '/testjumptrivia/images/gamebg.webp',
        '/testjumptrivia/images/startbg.jpg'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
