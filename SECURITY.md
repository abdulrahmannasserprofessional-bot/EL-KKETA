# 🔐 دليل أمان منصة ELKHETA المحدث قبل الإطلاق

> آخر تحديث: سبتمبر 2026 — بناءً على دليل المراجعة الأمنية الشاملة لمشاريع الـ SaaS

---

## ✅ ما تم تطبيقه وتنفيذه بالكامل

### 1. إحكام قواعد أمان Firebase (`database.rules.json`)
- [x] إلغاء سماحيات القراءة والكتابة العامة المفتوحة (`".read": true`, `".write": true`) من جذر قاعدة البيانات.
- [x] حظر قراءة ودراسة البيانات الكاملة لعقد الطلاب والأكواد والمشرفين والإعدادات وسجلات التدقيق (`Students`, `ActivationCodes`, `Supervisors`, `Settings`, `AuditLogs`, `SecurityAlerts`).
- [x] حصر الاستعلام واسترجاع ملفات الطلاب والأكواد على الاستعلام الفردي الخصيص (`Students/$studentCode` و `ActivationCodes/$codeId`).
- [x] اشتراط المصادقة والتحقق من الهوية والصلاحية (`auth != null`) لكافة عمليات تعديل وكتابة البيانات المحمية.

### 2. إدارة المفاتيح الحساسة (Secrets Management)
- [x] إنشاء `.gitignore` داخل `web_version` يمنع رفع `.env` وملفات الـ Service Account وغيرها.
- [x] إنشاء `.env.example` كنموذج لجميع المتغيرات المطلوبة.
- [x] تأمين `firebase-config.js` بتأمين الـ Database Rules وقصر الصلاحيات.

### 3. إزالة كلمات المرور المكشوفة (Hardcoded Passwords)
- [x] `mysql-api.js` — تمت إزالة كل bypass يعتمد على أرقام سرية مكشوفة.
- [x] `admin-gate.html` — تمت إزالة القائمة `validMasterPins` التي تحتوي على كلمات مرور مكشوفة.
- [x] `index.html` — تمت إزالة القائمة `validMasterPins`.
- [x] `admin-mysql.html` — تمت إزالة القيم المكشوفة من حقول الإدخال.
- [x] `admin-troubleshoot.html` — تمت إزالة القيم المكشوفة.
- [x] الاعتماد الصارم على `Firebase/Settings/adminPin` المحمية.

### 4. Input Sanitization & Rate Limiting — `security-validator.js`
- [x] دالة `sanitizeHTML()` لحماية من XSS.
- [x] دالة `sanitizeText()` لتنقية النصوص العامة.
- [x] دالة `detectPromptInjection()` لكشف هجمات Prompt Injection على نماذج الـ AI.
- [x] دالة `sanitizeForAI()` لتنقية المدخلات قبل إرسالها لـ AI.
- [x] دالة `checkRateLimit()` لحد أقصى للطلبات المسموحة بالدقيقة.
- [x] دالة `isWithinTokenLimit()` للحماية من Denial of Wallet.

### 5. حماية Brute Force لتسجيل الدخول
- [x] `admin-gate.html` — حظر بعد 5 محاولات فاشلة لمدة 15 دقيقة.
- [x] `index.html` — تسجيل وتتبع محاولات الدخول.

---

## 🚀 خطوة النشر الفوري لقواعد الأمان (Deploy Step)

من مجلد المشروع:
```bash
firebase deploy --only database
```
أو عبر **Firebase Console**:
1. افتح **Realtime Database** > **Rules**.
2. انسخ محتوى [database.rules.json](file:///c:/Users/Dell/AndroidStudioProjects/ELKKETA/web_version/database.rules.json).
3. اضغط على **Publish**.

---

## 📋 مصفوفة الصلاحيات والتسجيل (Roles & Audit)

| الدور | ينفع يعمل إيه؟ | ممنوع من إيه؟ |
| --- | --- | --- |
| **الطالب** | عرض الدروس والامتحانات وحل الاختبارات | رؤية بيانات طالب آخر أو تعديل الأكواد |
| **المشرف** | متابعة المجموعات وتقارير الحضور | تعديل الإعدادات الحساسة أو مسح السجلات |
| **الأدمن** | إدارة المنصة بالكامل وإنشاء الأكواد | القيام بأي تغيير حساس بدون تسجيل في `AuditLogs` |

---

## 🚨 ما يجب عدم فعله أبداً
- ❌ لا تضع `".read": "true"` أو `".write": "true"` على جذر قاعدة البيانات في الإنتاج.
- ❌ لا تحفظ Firebase Service Account JSON أو المفاتيح السرية داخل مستودع Git.
- ❌ لا تشارك ملفات `.env` أو مفاتيح الـ Admin في المراسلات.
