const CACHE_NAME = 'photolog-v2-singlefile';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We attempt to cache everything, but don't fail if external fonts/scripts fail 
      // (in case the user is already offline when installing)
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.log('Failed to cache ' + url, err));
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
           // Cache external requests dynamically
           if(event.request.url.startsWith('http')) {
               cache.put(event.request, fetchRes.clone());
           }
           return fetchRes;
        });
      });
    })
  );
});