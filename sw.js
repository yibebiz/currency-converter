const staticCacheName = "currency-converter-static-v4";
 
self.addEventListener("install", event=> {
   event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        "css/reset.css",
        "css/style.css",
        "js/currencyConvert.js",
        "js/swController.js",
        "sw.js",
        "index.html",
        "js/idb.js"
      ]);
    })
  );
 
});

self.addEventListener("activate", event=> {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName.startsWith("currency-converter") && !(staticCacheName===cacheName))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});


 self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open(staticCacheName).then(cache =>{
        return cache.match(event.request)
        .then(response => {
          if (response !== undefined) {
            return response;
          } else {
            return fetch(event.request).then(response =>{
              let responseClone = response.clone();
              caches.open(staticCacheName).then(cache=> cache.put(event.request, responseClone));
              return response;
            }).catch( ()=> caches.match('Ooops!, that is an error'));
          }
        })
      })
     );
  });

  //The message in the script is trigering this event everytime there
  //is a change in the sw, however, this should be 
  //triggered by consent of the user using toas message.

  self.addEventListener('message', event=> {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });
