/* public/firebase-messaging-sw.js */
/* global workbox, importScripts, firebase */

// 1) Install & activate immediately
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// 2) Raw push listener: catches every push event
self.addEventListener('push', event => {
  console.log('[SW] Raw push event:', event);
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
    return;
  }

  const title = data.data?.title || data.notification?.title || 'Notification';
  const body  = data.data?.body  || data.notification?.body  || '';

  // Use absolute URL if provided, else prefix relative path with origin
  let clickUrl = data.data?.url || self.location.origin;
  if (clickUrl.startsWith('/')) {
    clickUrl = self.location.origin + clickUrl;
  }

  self.registration.showNotification(title, {
    body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: '/CarRent.jpeg',
    requireInteraction: true,
    tag: data.data?.tag || data.notification?.tag,
    renotify: true,
    data: { ...data.data, url: clickUrl },
    actions: [{ action: 'close', title: 'Close' }],
    vibrate: [200, 100, 200]
  });
});

// 3) Workbox precaching
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
workbox.precaching.cleanupOutdatedCaches();
const manifest = Array.isArray(self.__WB_MANIFEST) ? self.__WB_MANIFEST : [];
if (manifest.length) {
  workbox.precaching.precacheAndRoute(manifest);
}

// 4) Firebase compat for onBackgroundMessage
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0',
  authDomain:        'toli-toli-bbea0.firebaseapp.com',
  projectId:         'toli-toli-bbea0',
  storageBucket:     'toli-toli-bbea0.firebasestorage.app',
  messagingSenderId: '622608058161',
  appId:             '1:622608058161:web:0e33e56df6a92289e81210',
  measurementId:     'G-WGM5X7HCC2'
});

const messaging = firebase.messaging();

// 5) onBackgroundMessage handler
messaging.onBackgroundMessage(payload => {
  console.log('[SW] onBackgroundMessage:', payload);

  const title = payload.data?.title || payload.notification?.title || 'Notification';
  const body  = payload.data?.body  || payload.notification?.body  || '';

  // Use absolute URL if provided
  let clickUrl = payload.data?.url || self.location.origin;
  if (clickUrl.startsWith('/')) {
    clickUrl = self.location.origin + clickUrl;
  }

  self.registration.showNotification(title, {
    body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: '/CarRent.jpeg',
    requireInteraction: true,
    tag: payload.data?.tag || payload.notification?.tag,
    renotify: true,
    data: { ...payload.data, url: clickUrl },
    actions: [{ action: 'close', title: 'Close' }],
    vibrate: [200, 100, 200]
  });

  // Inform clients to play sound
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => clients.forEach(client => client.postMessage({ type: 'PLAY_SOUND', payload })));
});

// 6) Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;

  const url = event.notification.data?.url || self.location.origin;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
