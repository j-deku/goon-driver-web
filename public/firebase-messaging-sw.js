/* global importScripts, firebase, workbox */

self.addEventListener('install',  e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// 1️⃣ Raw push handler
self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { return; }

  const title = payload.notification?.title || payload.data?.title || 'Ride Update';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const icon  = '/TT-logo.png';
  const badge = '/TT-logo.png';

  // build an absolute URL to deep‑link
  let clickUrl = payload.data?.url || '/';
  if (clickUrl.startsWith('/')) clickUrl = self.location.origin + clickUrl;

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    image: '/call-away.jpeg',
    vibrate: [200,100,200],
    requireInteraction: true,
    renotify: true,
    tag: payload.data?.tag || 'ride-update',
    data: { url: clickUrl },
    actions: [
      { action: 'view',  title: 'View Ride', icon: '/view.png' },
      { action: 'close', title: 'Dismiss',   icon: '/Cross_icon.png' }
    ]
  });
});

// 2️⃣ Firebase compat & background message
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

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title;
  const body  = payload.notification?.body  || payload.data?.body;
  const icon  = '/TT-logo.png';
  const badge = '/TT-logo.png';
    // build an absolute URL to deep‑link
  let clickUrl = payload.data?.url || '/';
  if (clickUrl.startsWith('/')) clickUrl = self.location.origin + clickUrl;

  // same rendering as above
  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    image: '/call-away.jpeg',
    vibrate: [200,100,200],
    requireInteraction: true,
    renotify: true,
    tag: payload.data?.tag || 'ride-update',
    data: { url: clickUrl },
    actions: [
      { action: 'view',  title: 'View Ride', icon: '/view.png' },
      { action: 'close', title: 'Dismiss',   icon: '/Cross_icon.png' }
    ]
  });
  // tell client pages to play sound
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      for (const client of clients) {
        client.postMessage({ type: 'PLAY_SOUND' });
      }
    });
});

// 3️⃣ Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;

  const url = event.notification.data?.url || self.location.origin;
  event.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true })
      .then(clients => {
        for (const c of clients) {
          if (c.url === url && 'focus' in c) return c.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});

// 4️⃣ (Optional) Workbox precache
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
if (workbox) {
  workbox.precaching.cleanupOutdatedCaches();
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
}
