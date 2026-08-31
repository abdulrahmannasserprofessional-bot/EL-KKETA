# 🚀 منصة الخطة - سيرفر MySQL REST API المجاني

سيرفر و REST API متكامل وعالي السرعة مبني بـ **Node.js & Express** ومتصل بقاعدة بيانات **MySQL** لتشغيل تطبيق الأندرويد وموقع المنصة التعليمية.

---

## 🎁 كيفية الحصول على قاعدة بيانات MySQL مجانية مدى الحياة (بدون فيزا):

### الخيار الأفضل: [TiDB Cloud](https://tidbcloud.com/) أو [Aiven](https://aiven.io/)
1. ادخل على [TiDB Cloud (tidbcloud.com)](https://tidbcloud.com/) وسجل حسابك بـ Google أو GitHub مجاناً.
2. اضغط **Create Cluster** واختر **Serverless (Free Tier)**.
3. اضغط **Connect** وانسخ رابط الاتصال (`DATABASE_URL`).
4. افتح أداة **SQL Editor** المدمجة في الموقع وقم بنسخ ولصق محتوى ملف `schema.sql` واضغط **Run** لإنشاء جميع الجداول تلقائياً!

---

## ⚡ الرفع المجاني على Vercel في ثوانٍ:
1. ادخل على [Vercel.com](https://vercel.com/) وسجل الدخول بحسابك في **GitHub**.
2. اضغط **Add New...** > **Project** واختر مستودع `EL-KKETA`.
3. في خيار **Root Directory** اختر مجلد:
   ```text
   backend_api
   ```
4. في قسم **Environment Variables** أضف:
   - `DATABASE_URL`: رابط قاعدة بيانات MySQL الخاص بك.
   - `JWT_SECRET`: أي نص عشوائي لحماية التوكنات (مثل `elkheta_secret_key_2026`).
5. اضغط **Deploy**! سيعطيك Vercel رابط API فوري مثل:
   👉 `https://elkheta-api.vercel.app/api/health`

---

## 📡 أهم مسارات الـ API المتاحة لتطبيق الأندرويد والموقع:

| المسار | الطريقة | الوصف |
| :--- | :--- | :--- |
| `/api/auth/student` | `POST` | تسجيل دخول الطالب / قفل الجهاز التلقائي |
| `/api/auth/admin/login` | `POST` | تسجيل دخول لوحة التحكم |
| `/api/lectures` | `GET` | جلب المحاضرات والفيديوهات والمذكرات |
| `/api/lectures/save` | `POST` | إضافة / تعديل محاضرة |
| `/api/codes/redeem` | `POST` | شحن كود في محفظة الطالب |
| `/api/codes/generate` | `POST` | توليد حزم أكواد جديدة |
| `/api/exams` | `GET` | جلب الامتحانات والأسئلة |
| `/api/exams/submit` | `POST` | تسليم وتصحيح الامتحان تلقائياً |
| `/api/students` | `GET` | استعراض الطلاب والبحث |
| `/api/settings` | `GET` | فحص وضع الصيانة ورقم الواتساب |
| `/api/health` | `GET` | فحص اتصال وسرعة استجابة قاعدة البيانات |
