# 🔐 دليل أمان منصة ELKHETA

> آخر تحديث: سبتمبر 2026

---

## ✅ ما تم تطبيقه

### 1. إدارة المفاتيح الحساسة (Secrets Management)
- [x] إنشاء `.gitignore` داخل `web_version` يمنع رفع `.env` وملفات الـ Service Account وغيرها
- [x] إنشاء `.env.example` كنموذج لجميع المتغيرات المطلوبة
- [x] **تحذير**: `firebase-config.js` يحتوي على `apiKey` — هذا مقبول لـ Firebase Web فقط بشرط تأمين Database Rules

### 2. Firebase Database Rules
- [x] تم تغيير `".read": "true"` و `".write": "true"` إلى `".read": false` و `".write": false`
- [x] تم وضع قيود `auth != null` على كل مسار في قاعدة البيانات
- [x] **مهم**: يجب نشر Rules المحدّثة عبر Firebase Console

### 3. إزالة كلمات المرور المكشوفة (Hardcoded Passwords)
- [x] `mysql-api.js` — تمت إزالة كل bypass يعتمد على `'2862005'`
- [x] `admin-gate.html` — تمت إزالة القائمة `validMasterPins` التي تحتوي على 7 كلمات مرور مكشوفة
- [x] `index.html` — تمت إزالة القائمة `validMasterPins`
- [x] `admin-mysql.html` — تمت إزالة `value="2862005"` من حقل الإدخال
- [x] `admin-troubleshoot.html` — تمت إزالة `inputValue: '2862005'`
- [x] **الآن**: المصادقة تعتمد فقط على `Firebase/Settings/adminPin`

### 4. Input Sanitization & Rate Limiting — `security-validator.js`
- [x] دالة `sanitizeHTML()` لحماية من XSS
- [x] دالة `sanitizeText()` لتنقية النصوص العامة
- [x] دالة `detectPromptInjection()` لكشف هجمات Prompt Injection
- [x] دالة `sanitizeForAI()` لتنقية المدخلات قبل إرسالها لنماذج AI
- [x] دالة `checkRateLimit()` لحد أقصى للطلبات
- [x] دالة `isWithinTokenLimit()` للحماية من Denial of Wallet

### 5. حماية Brute Force لتسجيل الدخول
- [x] `admin-gate.html` — حظر بعد 5 محاولات فاشلة لمدة 15 دقيقة
- [x] `index.html` — تسجيل المحاولات الفاشلة

---

## ⚠️ ما يجب عليك فعله الآن

### أولاً: نشر Firebase Rules (فوري ومهم جداً)
```bash
# من مجلد web_version:
firebase deploy --only database
```
أو من **Firebase Console**:
- Realtime Database > Rules > انسخ محتوى `database.rules.json` > Publish

### ثانياً: تغيير كلمة مرور الأدمن
بما أن `2862005` أصبحت معروفة في تاريخ Git:
1. افتح **Firebase Console** > Realtime Database
2. انتقل إلى `Settings/adminPin`
3. **غيّرها فوراً** لكلمة مرور قوية جديدة (أرقام + حروف)

### ثالثاً: تنظيف تاريخ Git (اختياري لكن موصى به)
```bash
# إذا رُفعت الكلمات على GitHub من قبل، اعمل rotate للـ secrets
git log --oneline | head -20
# ثم تواصل مع GitHub لمسح البيانات الحساسة من التاريخ
```

---

## 🔒 كيفية استخدام security-validator.js

### في أي صفحة HTML:
```html
<script src="security-validator.js"></script>
```

### تنقية المدخلات:
```javascript
// تنقية قبل عرض في HTML
const safeText = SecurityValidator.sanitizeHTML(userInput);

// تنقية قبل إرسال لـ AI
const cleanInput = SecurityValidator.sanitizeForAI(userInput);
if (!cleanInput) {
    showToast("المدخلات تحتوي على محتوى مشبوه", "error");
    return;
}
```

### Rate Limiting:
```javascript
// حد أقصى 5 طلبات كل دقيقة
if (!SecurityValidator.checkRateLimit('ai_request', 5, 60000)) {
    const wait = SecurityValidator.getRateLimitRemainingSeconds('ai_request', 60000);
    showToast(`يرجى الانتظار ${wait} ثانية قبل المحاولة مجدداً`, "error");
    return;
}
```

### حد التوكنز (Denial of Wallet):
```javascript
if (!SecurityValidator.isWithinTokenLimit(userMessage, 500)) {
    showToast("الرسالة طويلة جداً (الحد الأقصى 500 توكن)", "error");
    return;
}
```

---

## 📋 Checklist مراجعة دورية

| المهمة | التكرار |
|--------|---------|
| مراجعة Firebase Database Rules | شهرياً |
| تغيير Admin PIN | كل 3 أشهر |
| مراجعة Supervisors النشطين | شهرياً |
| فحص سجلات النشاط المشبوه | أسبوعياً |
| مراجعة تكاليف Firebase/API | أسبوعياً |
| فحص الحزم المثبّتة (npm audit) | عند كل تحديث |

---

## 🚨 ما يجب عدم فعله أبداً

- ❌ لا تكتب كلمات مرور أو مفاتيح API مباشرة في الكود
- ❌ لا تستخدم `".read": "true"` في Firebase Rules في الإنتاج
- ❌ لا تحفظ Firebase Service Account JSON داخل المستودع
- ❌ لا تشارك ملف `.env` مع أي شخص
- ❌ لا تعطِ AI Agent صلاحية DELETE مباشرة على قاعدة البيانات
- ❌ لا ترسل مدخلات المستخدم مباشرة لنموذج AI بدون تنقية
