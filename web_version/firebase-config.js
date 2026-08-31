// ملف إعدادات Firebase الموحد لنسخة الويب
const firebaseConfig = {
    apiKey: "AIzaSyBMuMzSDklOoE5dfjirxKJaw2m5ru-TkP8",
    authDomain: "elkhotta.firebaseapp.com",
    databaseURL: "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elkhotta",
    storageBucket: "elkhotta.firebasestorage.app",
    messagingSenderId: "458941220534",
    appId: "1:458941220534:web:6e18f2f2118335f608817" // تم استخراجه من بيانات المشروع
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
