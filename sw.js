 var staticCacheName = "currency-converter-static-v2";
 
self.addEventListener("install", function(event) {
console.log("Service Worker registered")
   event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        "/css/reset.css",
        "/css/style.css",
        "/js/currencyConvert.js",
        "/js/swController.js",
        "/sw.js",
        "/index.html",
        "/js/idb.js"
      ]);
    })
  );
 
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
            return (
              cacheName.startsWith("currency-converter") && !(staticCacheName===cacheName)
            );
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});


 self.addEventListener('fetch', function(event) {
  
    event.respondWith(
      caches.open(staticCacheName).then(function(cache){
        return cache.match(event.request)
        .then(function(response) {
          // caches.match() always resolves
          // but in case of success response will have value
          if (response !== undefined) {
            return response;
          } else {
            return fetch(event.request).then(function (response) {
              let responseClone = response.clone();
              
              caches.open(staticCacheName).then(function (cache) {
                cache.put(event.request, responseClone);
              });
              return response;
            }).catch(function () {
              return caches.match('Ooops!, that is an error');
            });
          }
        })
      })
     );
  });

  //The message in the script is trigering this event everytime there
  //is a change in the sw, however, this should be 
  //triggered by consent of the user using toas message.

  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });
