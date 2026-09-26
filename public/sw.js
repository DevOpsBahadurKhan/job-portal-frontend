const CACHE_NAME = 'job-portal-v1';
const urlsToCache = ['/'];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Job Portal',
    body: 'New notification',
    icon: '/next.svg',
    badge: '/next.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  if (event.data) {
    try {
      const dataText = event.data.text();
      console.log('Push data text:', dataText);
      
      try {
        const dataJson = JSON.parse(dataText);
        console.log('Push data JSON:', dataJson);
        
        if (dataJson.title) notificationData.title = dataJson.title;
        if (dataJson.body) notificationData.body = dataJson.body;
        if (dataJson.message) notificationData.body = dataJson.message;
        if (dataJson.icon) notificationData.icon = dataJson.icon;
        if (dataJson.url) notificationData.data.url = dataJson.url;
      } catch (e) {
        console.log('Data is not JSON, using as text');
        notificationData.body = dataText;
      }
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  console.log('Showing notification:', notificationData);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
