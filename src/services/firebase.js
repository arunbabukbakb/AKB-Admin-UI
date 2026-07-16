import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import apiService from './api';

const firebaseConfig = {
  apiKey: "AIzaSyCx63QlWcqFtS4YcWCBlCAtW2GiBenFwoo",
  authDomain: "akbpushnotification.firebaseapp.com",
  projectId: "akbpushnotification",
  storageBucket: "akbpushnotification.firebasestorage.app",
  messagingSenderId: "143288382601",
  appId: "1:143288382601:web:a96fd08b34964560474258",
  measurementId: "G-XTYPFZL84G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request permission and register token for the user
export const requestNotificationPermission = async (userId) => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get FCM token using explicit service worker registration to prevent timeouts in dev server
      let token;
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        token = await getToken(messaging, {
          serviceWorkerRegistration: registration
        });
      } else {
        token = await getToken(messaging);
      }

      if (token) {
        console.log('FCM Token generated:', token);
        // Save the token to the backend using the existing endpoint
        await apiService.post('User/UserTokenUpdate', {
          userId: parseInt(userId),
          token: token
        });
        return token;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Permission not granted for notifications.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Listen for foreground messages (returns unsubscribe function)
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};
