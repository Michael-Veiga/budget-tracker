console.log('Hello service worker');

const FILES_TO_CACHE = [
  '/',
  '/db.js',
  '/index.html',
  '/index.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// installation event listener
self.addEventListener('install', function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activation event listener
self.addEventListener('activate', function (evt) {
  // retrieve keys from the cache
  evt.waitUntil(
    //   caches is object that contains all our caches, keys() grabs all caches from object
    caches.keys().then(keyList => {
      //  pass in list of keys retrieved from caches.keys()
      return Promise.all(
        //   Create new array by modifying each element in keylist
        keyList.map(key => {
          // check to see if the key is not equal to the name of our caches
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            //   if the data is not equal to the data of either of the caches, then the name is old.
            console.log('Removing existing cache data', key);
            return caches.delete(key);
            // delete the key
          }
        })
      );
    })
  );
  self.clients.claim();
});

// fetch
self.addEventListener('fetch', evt => {
  if (evt.request.url.includes('/api/')) {
    console.log('[Service Worker] Fetch(data)', evt.request.url);

    evt.respondWith(
      // open specified cache
      caches.open(DATA_CACHE_NAME).then(cache => {
        //   pass in the opened cache and return the request of our fetch call made
        return fetch(evt.request)
          .then(response => {
            //   if the response is ok..
            if (response.status === 200) {
              // clone the fetch response into our cache for offline
              cache.put(evt.request.url, response.clone());
            }
            // return response so we can respond with it
            return response;
          })
          .catch(err => {
            //   If theres an error, attempt to grab the fetch from the cache.
            return cache.match(evt.request);
          });
      })
    );
    return;
  }
  // fetch doesn't contain /api
  evt.respondWith(
    //   caches contain all our caches. Use open to method to grab specific cache
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        //   if response exists then return it, otherwise make a fetch with the request
        return response || fetch(evt.request);
      });
    })
  );
});
