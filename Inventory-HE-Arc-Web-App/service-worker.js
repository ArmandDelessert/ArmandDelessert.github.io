/*
Service Worker pour Inventory-HE-Arc-Web-App.
*/

var dataCache = 'inventoryWebAppData-v1';
var resourcesCache = 'inventoryWebAppCache-1';
var filesToCache = [
  '/index.html',
  '/main.js',
  '/js/webcodecamjs.js',
  '/js/qrcodelib.js',
  '/js/DecoderWorker.js',
  '/css/foundation.css',
  '/audio/beep.mp3'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(resourcesCache).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache).catch(function(err) {
        console.log("[ServiceWorker] Error: Failed to cache files.", err);
      });
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== resourcesCache && key !== dataCache) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  // var dataUrl = 'https://inventory-dev.ing.he-arc.ch';
  // var dataUrl2 = 'https://demo6654639.mockable.io';
  // if (e.request.url.indexOf(dataUrl2) > -1) {
  //   console.log('[Service Worker] Response cached', e.request.url);
  //   /*
  //    * When the request URL contains dataUrl, the app is asking for fresh
  //    * weather data. In this case, the service worker always goes to the
  //    * network and then caches the response. This is called the "Cache then
  //    * network" strategy:
  //    * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
  //    */
  //   e.respondWith(
  //     caches.open(dataCache).then(function(cache) {
  //       return fetch(e.request).then(function(response) {
  //         cache.put(e.request.url, response.clone());
  //         return response;
  //       });
  //     })
  //   );
  // } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  // }
});
