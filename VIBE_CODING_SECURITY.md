# ⚡ دليل وقواعد الأمان الفائق للـ Vibe Coding (High-Security Vibe Coding Rules)

> **منصة ELKHETA** | حماية شاملة لمنهجيات التطوير السريع بالذكاء الاصطناعي (Vibe Coding)

---

## 🎯 ما هو أمان الـ Vibe Coding؟
الـ **Vibe Coding** هو أسلوب التطوير والسريع وتوليد الأكواد باستخدام نماذج الذكاء الاصطناعي والأعوان (AI Agents).  
لضمان **أمان عالي جداً (Enterprise-Grade Security)** وعدم إدخال أي ثغرات بالخطأ أثناء الكتابة السريعة، يجب الالتزام الصارم بالقواعد الأربعة التالية:

---

## 🔒 القواعد الأربعة الحاكمة للـ Vibe Coding السريع والآمن

### 1️⃣ قاعدة حظر المفاتيح المسربة (Zero-Hardcoded Secrets)
- ❌ **ممنوع نهائياً:** كتابة أي كلمة مرور، مفتاح Stripe، رابط داتابيز، أو Firebase Service Account JSON مباشرة داخل كود JS أو Python أو HTML.
- ✅ **الصحيح دائماً:** الاعتماد الحصري على متغيرات البيئة (`process.env` في JS أو `os.environ` في Python) وتصدير النموذج في `.env.example`.

### 2️⃣ قاعدة التحقق على السيرفر أولاً (Backend-First Validation)
- ❌ **ممنوع نهائياً:** الاعتماد على إخفاء الزر بالـ CSS أو الفحص في الواجهة فقط لتقييد الصلاحيات.
- ✅ **الصحيح دائماً:** رفض أي طلب غير مصرح به على مستوى Firebase Rules أو Backend API بـ `401/403` قبل تنفيذ العملية.

### 3️⃣ قاعدة التنقية والـ Rate Limit قبل إرسال البيانات للـ AI
- ❌ **ممنوع نهائياً:** تمرير مدخلات المستخدم الخام (Raw User Input) إلى نماذج الذكاء الاصطناعي أو قواعد البيانات مباشرة.
- ✅ **الصحيح دائماً:** استخدام `SecurityValidator.sanitizeForAI(input)` و `SecurityValidator.checkRateLimit()` لمنع هجمات **Prompt Injection** و **Denial of Wallet**.

### 4️⃣ قاعدة الفحص التلقائي قبل أي نشر (Pre-Deploy Automated Audit)
- تشغيل سكربت الفحص الأمني التلقائي:
  ```bash
  python python_manager/scan_secrets.py
  ```
  هذا السكربت يمسح جميع ملفات الكود في ثوانٍ ويتأكد من عدم وجود أي مفاتيح مسربة أو أخطاء أمنية قبل دفع الكود للإنتاج.

---

## 🛠️ الأداة الأمنية التلقائية للمشروع
- **أداة فحص الأسرار والتسريبات:** [python_manager/scan_secrets.py](file:///c:/Users/Dell/AndroidStudioProjects/ELKKETA/web_version/python_manager/scan_secrets.py)
- **مكتبة الحماية والتنقية:** [security-validator.js](file:///c:/Users/Dell/AndroidStudioProjects/ELKKETA/web_version/security-validator.js)
- **قواعد الداتابيز المحدثة:** [database.rules.json](file:///c:/Users/Dell/AndroidStudioProjects/ELKKETA/web_version/database.rules.json)
