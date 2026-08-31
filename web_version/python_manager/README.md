# README - مدير منصة ELKHETA بالبايثون

## المتطلبات
```
pip install firebase-admin openpyxl
```

## إعداد المفتاح
1. افتح لوحة Firebase → Project Settings → Service Accounts
2. اضغط "Generate new private key"
3. احفظ الملف بجوار `main.py` باسم `serviceAccountKey.json`

## الأوامر المتاحة

### أكواد التفعيل
```bash
# توليد 50 كود
python main.py codes --generate 50 --prefix KH

# عرض الأكواد
python main.py codes --list

# حذف الأكواد المستخدمة
python main.py codes --delete-used
```

### الطلاب
```bash
# عرض قائمة الطلاب
python main.py students --list

# تصدير Excel
python main.py students --export

# حذف حسابات وهمية
python main.py students --delete-fake

# تقرير أفضل الطلاب
python main.py students --stats-report
```

### الامتحانات
```bash
python main.py exams --list
python main.py exams --delete-old
```

### الإحصائيات
```bash
python main.py stats --leaderboard
python main.py stats --summary
```
