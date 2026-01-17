importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCqvdelOGIkAIToFjdU7rbeZRNdXEy72-I",
  authDomain: "projet-devops-et-apis-f9524.firebaseapp.com",
  projectId: "projet-devops-et-apis-f9524",
  storageBucket: "projet-devops-et-apis-f9524.firebasestorage.app",
  messagingSenderId: "704851120956",
  appId: "1:704851120956:web:eb2cd9d935bf18e9110439"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/badge.png',
    tag: 'notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
