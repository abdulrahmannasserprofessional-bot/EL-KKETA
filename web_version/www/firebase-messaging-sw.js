importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBMuMzSDklOoE5dfjirxKJaw2m5ru-TkP8",
    authDomain: "elkhotta.firebaseapp.com",
    databaseURL: "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elkhotta",
    storageBucket: "elkhotta.firebasestorage.app",
    messagingSenderId: "458941220534",
    appId: "1:458941220534:web:6e18f2f2118335f608817"
});

const messaging = firebase.messaging();

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = 'https://elkheta2026.web.app/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('elkheta2026.web.app') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
