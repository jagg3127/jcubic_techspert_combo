/* global importScripts, firebase */

importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyBPbmaHbZ34hR-KQhb5zdkqgjfPj3_6uj8",
  authDomain: "chat-jcubic.firebaseapp.com",
  projectId: "chat-jcubic",
  storageBucket: "chat-jcubic.appspot.com",
  messagingSenderId: "245061104565",
  appId: "1:245061104565:web:e0894b54a6a53ad47a5ffc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const {title, ...options} = payload.notification;
  return self.registration.showNotification(title, options);
});

self.addEventListener('install', self.skipWaiting);
self.addEventListener('activate', self.skipWaiting);
