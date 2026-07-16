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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have received a new message.',
    icon: '/favicon.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
