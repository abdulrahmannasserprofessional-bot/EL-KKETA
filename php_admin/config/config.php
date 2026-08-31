<?php
/**
 * ELKHETA Educational Platform - Firebase & Dashboard Config
 * إعدادات الاتصال بـ Firebase ولوحة التحكم
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ----------------------------------------------------
// 1. إعدادات Firebase Realtime Database
// ----------------------------------------------------
define('FIREBASE_DB_URL', 'https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app');
define('FIREBASE_PROJECT_ID', 'elkhotta');
define('FIREBASE_STORAGE_BUCKET', 'elkhotta.firebasestorage.app');

// مفتاح سر قاعدة البيانات (Database Secret) أو اترك فارغاً إذا كانت القواعد عامة/تستخدم Service Account
// يمكنك الحصول عليه من Firebase Console -> Project Settings -> Service Accounts -> Database Secrets
define('FIREBASE_DB_SECRET', '');

// مسار ملف Service Account JSON (اختياري للإشعارات المتقدمة FCM v1 والأمان العالي)
define('FIREBASE_SERVICE_ACCOUNT_PATH', __DIR__ . '/service-account.json');

// مفتاح خادم FCM القديم (Server Key) إن وجد (Firebase Cloud Messaging Legacy Key)
define('FCM_SERVER_KEY', '');

// ----------------------------------------------------
// 2. إعدادات لوحة التحكم وبيانات الدخول الافتراضية
// ----------------------------------------------------
define('APP_NAME', 'لوحة تحكم الخطة - ELKHETA');
define('ADMIN_DEFAULT_USER', 'admin');
define('ADMIN_DEFAULT_PASS', 'admin123456'); // يُنصح بتغييره من صفحة الإعدادات

// إعدادات المنطقة الزمنية
date_default_timezone_set('Africa/Cairo');
