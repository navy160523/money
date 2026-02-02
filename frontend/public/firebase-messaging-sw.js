/* public/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBejIcQwYnvKuGSLchBMhYjZG1FG4pxdJs",
    authDomain: "money-b72e6.firebaseapp.com",
    projectId: "money-b72e6",
    storageBucket: "money-b72e6.firebasestorage.app",
    messagingSenderId: "814042038157",
    appId: "1:814042038157:web:46ef7334e673a0ca4d87c4",
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png', // Fallback to icon if available
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
