// Import and configure the Firebase SDK compat scripts inside the Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCx63QlWcqFtS4YcWCBlCAtW2GiBenFwoo",
  authDomain: "akbpushnotification.firebaseapp.com",
  projectId: "akbpushnotification",
  storageBucket: "akbpushnotification.firebasestorage.app",
  messagingSenderId: "143288382601",
  appId: "1:143288382601:web:a96fd08b34964560474258",
  measurementId: "G-XTYPFZL84G"
});

// Retrieve an instance of Firebase Messaging to handle background messages
const messaging = firebase.messaging();

// Immediate activation of new service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// IndexedDB setup for syncing notifications
const DB_NAME = 'fcm_notifications_db';
const DB_VERSION = 2;
const STORE_NAME = 'notifications';

function openDB() {
  console.log('[FCM SW] Opening IndexedDB:', DB_NAME, 'version:', DB_VERSION);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => {
      console.error('[FCM SW] IndexedDB open error:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('[FCM SW] IndexedDB opened successfully');
      resolve(request.result);
    };
    request.onupgradeneeded = (event) => {
      console.log('[FCM SW] IndexedDB upgrade needed');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('[FCM SW] Creating object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function saveNotificationToDB(notification) {
  console.log('[FCM SW] Saving notification to DB:', notification);
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(notification);
      request.onsuccess = () => {
        console.log('[FCM SW] Notification saved successfully to IndexedDB');
        resolve();
      };
      request.onerror = () => {
        console.error('[FCM SW] Notification save request failed:', request.error);
        reject(request.error);
      };
    });
  });
}

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have received a new message.',
    icon: '/favicon.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // Sync background notification to frontend client
  const notifId = payload.messageId || Date.now().toString();
  const newNotif = {
    id: notifId,
    title: payload.notification?.title || 'Notification',
    body: payload.notification?.body || '',
    date: new Date().toLocaleTimeString(),
    read: false,
    url: payload.data?.url || '',
    type: payload.data?.type || ''
  };

  // 1. Save to IndexedDB (for reading when the app is eventually opened/focused)
  saveNotificationToDB(newNotif).catch((err) => {
    console.error('[FCM SW] Catch: Error saving notification to IndexedDB:', err);
  });

  // 2. Broadcast via BroadcastChannel (for real-time update in open tabs)
  try {
    console.log('[FCM SW] Broadcasting notification via channel...');
    const channel = new BroadcastChannel('fcm_notifications');
    channel.postMessage({ type: 'BACKGROUND_NOTIFICATION', payload: newNotif });
    channel.close();
    console.log('[FCM SW] Broadcast completed successfully');
  } catch (err) {
    console.warn('[FCM SW] BroadcastChannel error:', err);
  }
});

// Handle notification click to focus tab or open a new window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';
  if (data.url && data.url.startsWith('/')) {
    targetUrl = data.url;
  } else if (data.functionUrl && data.functionUrl.startsWith('/')) {
    targetUrl = data.functionUrl;
  } else if (data.click_action && data.click_action.startsWith('/')) {
    targetUrl = data.click_action;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window client if one exists
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.navigate && client.url !== self.location.origin + targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no open window client, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
