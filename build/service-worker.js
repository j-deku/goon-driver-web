/* eslint-disable no-undef */
/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA2rSk4t-cgCOJ7QDtjlzPEo7VV3xasWGU",
  authDomain: "transbook-26f54.firebaseapp.com",
  projectId: "transbook-26f54",
  messagingSenderId: "1082726282604",
  appId: "1:1082726282604:web:bc398a9e02830c65f7af49",
  measurementId: "G-W2JXPJ6ZX0",
});

const messaging = firebase.messaging();

// Listen for background messages (when the page is not in focus or closed)
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);

  // Prefer data payload if available
  const notificationTitle = payload.data?.title || payload.notification.title;
  const notificationOptions = {
    body: payload.data?.body || payload.notification.body,
    icon: '/push_notification_icon.png',
    badge: '/badge_icon.png',
    image: "/CarRent.jpeg",
    requireInteraction: true, // Keep notification visible until interaction
    tag: payload.data?.tag || 'transbook-notification',
    renotify: true,
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/', 
      rideId: payload.data?.rideId || '',
      bookingId: payload.data?.bookingId || '',
    },
    actions: [
      {
        action: 'close', // Custom action key to close the notification
        title: "Close",
      },
    ]
  };

  // Inform all client pages to play a custom sound (if allowed)
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PLAY_SOUND',
        payload,
      });
    });
  });

  // Show the system notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Updated notification click handler with proper deep linking and close action handling
self.addEventListener('notificationclick', (event) => {
  console.log("Notification click event:", event);

  // If the user clicked the "close" action, simply close the notification and exit.
  if (event.action === 'close') {
    event.notification.close();
    return;
  }
  
  event.notification.close();

  // Determine URL to open (default to homepage if not provided)
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an open window that matches the deep link
      for (const client of clientList) {
        if (client.url.indexOf(urlToOpen) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // If not found, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
