#!/usr/bin/env python3
"""
ELKHETA Platform Python Manager
أداة التحكم الشاملة في منصة الخطة التعليمية

الاستخدام:
    python main.py --help
    python main.py codes --generate 50 --prefix KH
    python main.py students --export
    python main.py students --delete-fake
    python main.py exams --list
    python main.py stats --leaderboard
"""

import argparse
import json
import os
import sys
import random
import string
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, db
except ImportError:
    print("⚠️ مكتبة firebase-admin غير موجودة. جاري تثبيتها...")
    os.system(f"{sys.executable} -m pip install firebase-admin openpyxl requests")
    import firebase_admin
    from firebase_admin import credentials, db

try:
    import openpyxl
    EXCEL_AVAILABLE = True
except ImportError:
    EXCEL_AVAILABLE = False

# ─── Initialize Firebase ───────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_PATH = os.path.join(SCRIPT_DIR, "serviceAccountKey.json")
DATABASE_URL = "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app"

def init_firebase():
    """Initialize Firebase Admin SDK."""
    if firebase_admin._apps:
        return  # Already initialized
    
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        print(f"""
❌ ملف مفتاح الخدمة غير موجود: {SERVICE_ACCOUNT_PATH}

للحصول عليه:
  1. افتح لوحة تحكم Firebase → Project Settings
  2. اختر Service Accounts
  3. اضغط Generate new private key
  4. احفظ الملف بجوار هذا السكربت باسم: serviceAccountKey.json
""")
        sys.exit(1)
    
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})
    print("✅ تم الاتصال بقاعدة البيانات بنجاح!")

# ─── Helper Functions ──────────────────────────────────────────────────────────
def generate_code(prefix="KH", length=6):
    """Generate a unique activation code."""
    random_part = ''.join(random.choices(string.digits + string.ascii_uppercase, k=length))
    return f"{prefix.upper()}{random_part}"

def timestamp_to_str(ts):
    """Convert Firebase timestamp (milliseconds) to readable string."""
    if not ts:
        return "غير محدد"
    try:
        return datetime.fromtimestamp(int(ts)/1000).strftime('%Y-%m-%d %H:%M')
    except:
        return str(ts)

# ─── CODES MANAGEMENT ─────────────────────────────────────────────────────────
def cmd_codes(args):
    init_firebase()
    ref = db.reference('ActivationCodes')
    
    if args.generate:
        count = args.generate
        prefix = getattr(args, 'prefix', 'KH')
        existing = ref.get() or {}
        
        print(f"\n🔑 جاري توليد {count} كود تفعيل بمقدمة '{prefix}'...")
        new_codes = {}
        generated = []
        
        for _ in range(count):
            while True:
                code = generate_code(prefix)
                if code not in existing and code not in new_codes:
                    break
            new_codes[code] = {
                "isUsed": False,
                "createdAt": int(datetime.now().timestamp() * 1000),
                "prefix": prefix
            }
            generated.append(code)
        
        ref.update(new_codes)
        print(f"✅ تم توليد ورفع {count} كود بنجاح!")
        print("\nالأكواد المولّدة:")
        for c in generated:
            print(f"  ▸ {c}")
        
        # Export to text file
        fname = f"codes_{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(f"أكواد تفعيل منصة ELKHETA - {prefix}\n")
            f.write(f"التاريخ: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            f.write("="*40 + "\n")
            for c in generated:
                f.write(c + "\n")
        print(f"\n📄 تم حفظ الأكواد في: {fname}")

    elif args.list:
        codes = ref.get() or {}
        print(f"\n📋 إجمالي الأكواد: {len(codes)}")
        used = sum(1 for v in codes.values() if isinstance(v, dict) and v.get('isUsed'))
        unused = len(codes) - used
        print(f"  ✅ مستخدمة: {used}")
        print(f"  🔓 متاحة: {unused}")
        
        print("\nعينة من الأكواد المتاحة:")
        shown = 0
        for code, val in codes.items():
            if isinstance(val, dict) and not val.get('isUsed'):
                print(f"  ▸ {code}")
                shown += 1
                if shown >= 10:
                    print(f"  ... و{unused - 10} أخرى")
                    break
    
    elif args.delete_used:
        codes = ref.get() or {}
        to_delete = {k: None for k, v in codes.items() if isinstance(v, dict) and v.get('isUsed')}
        if to_delete:
            ref.update(to_delete)
            print(f"🗑️ تم حذف {len(to_delete)} كود مستخدم!")
        else:
            print("✅ لا توجد أكواد مستخدمة للحذف.")

# ─── STUDENTS MANAGEMENT ──────────────────────────────────────────────────────
def cmd_students(args):
    init_firebase()
    ref = db.reference('Students')
    students = ref.get() or {}
    
    if args.list:
        print(f"\n👥 إجمالي الطلاب: {len(students)}")
        print(f"\n{'الكود':<12} {'الاسم':<25} {'واتساب':<15}")
        print("-" * 55)
        for code, data in list(students.items())[:50]:
            if isinstance(data, dict):
                name = data.get('fullName', 'غير محدد')
                phone = data.get('whatsapp', 'غير محدد')
                print(f"{code:<12} {name:<25} {phone:<15}")
        if len(students) > 50:
            print(f"\n... و {len(students) - 50} طالب آخر")
    
    elif args.export:
        if not EXCEL_AVAILABLE:
            print("⚠️ مكتبة openpyxl غير موجودة. جاري التثبيت...")
            os.system(f"{sys.executable} -m pip install openpyxl")
            import openpyxl
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "الطلاب"
        ws.append(["كود الطالب", "الاسم الكامل", "رقم الواتساب", "تاريخ التسجيل", "متوسط الدرجات"])
        
        for code, data in students.items():
            if isinstance(data, dict):
                stats = data.get('stats', {})
                ws.append([
                    code,
                    data.get('fullName', ''),
                    data.get('whatsapp', ''),
                    timestamp_to_str(data.get('createdAt')),
                    stats.get('averageScore', 0) if isinstance(stats, dict) else 0
                ])
        
        fname = f"students_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        wb.save(fname)
        print(f"✅ تم تصدير {len(students)} طالب إلى: {fname}")
    
    elif args.delete_fake:
        # Delete students with clearly fake/empty names
        fake = {k: None for k, v in students.items() 
                if isinstance(v, dict) and (
                    not v.get('fullName') or 
                    len(v.get('fullName', '')) < 3 or
                    not v.get('whatsapp')
                )}
        if fake:
            confirm = input(f"⚠️ سيتم حذف {len(fake)} طالب وهمي. هل أنت متأكد؟ (نعم/لا): ")
            if confirm.strip() in ['نعم', 'yes', 'y']:
                ref.update(fake)
                print(f"🗑️ تم حذف {len(fake)} حساب وهمي!")
        else:
            print("✅ لا توجد حسابات وهمية للحذف!")
    
    elif args.stats_report:
        scores = []
        for code, data in students.items():
            if isinstance(data, dict):
                stats = data.get('stats', {})
                if isinstance(stats, dict) and stats.get('averageScore'):
                    scores.append((data.get('fullName', code), stats['averageScore'], stats.get('examsTaken', 0)))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        print(f"\n🏆 أفضل الطلاب (من {len(students)} طالب):")
        print(f"\n{'#':<4} {'الاسم':<25} {'المعدل':<10} {'عدد الامتحانات'}")
        print("-" * 55)
        for i, (name, avg, count) in enumerate(scores[:20], 1):
            print(f"{i:<4} {name:<25} {avg:<10.1f}% {count}")

# ─── EXAMS MANAGEMENT ─────────────────────────────────────────────────────────
def cmd_exams(args):
    init_firebase()
    ref = db.reference('Exams')
    exams_data = ref.get() or {}
    
    if args.list:
        total = 0
        print("\n📚 الامتحانات في قاعدة البيانات:\n")
        for key, val in exams_data.items():
            if isinstance(val, dict) and (val.get('title') or val.get('name') or val.get('jsonCode')):
                # Old flat exam
                print(f"  📝 {val.get('title') or val.get('name') or key} [مباشر]")
                total += 1
            elif isinstance(val, dict):
                # Subject group
                print(f"\n📂 {key}:")
                for eid, exam in val.items():
                    if isinstance(exam, dict):
                        print(f"    📝 {exam.get('title') or exam.get('name') or eid}")
                        total += 1
        print(f"\n✅ إجمالي الامتحانات: {total}")
    
    elif args.delete_old:
        to_delete = {}
        for key, val in exams_data.items():
            if isinstance(val, dict) and (val.get('title') or val.get('name') or val.get('jsonCode')):
                to_delete[key] = None
        
        if to_delete:
            confirm = input(f"⚠️ سيتم حذف {len(to_delete)} امتحان قديم. هل أنت متأكد؟ (نعم/لا): ")
            if confirm.strip() in ['نعم', 'yes', 'y']:
                ref.update(to_delete)
                print(f"🗑️ تم حذف {len(to_delete)} امتحان قديم!")
        else:
            print("✅ لا توجد امتحانات قديمة للحذف!")

# ─── STATS ────────────────────────────────────────────────────────────────────
def cmd_stats(args):
    init_firebase()
    
    if args.leaderboard:
        lb = db.reference('Leaderboard').get() or {}
        ranking = sorted(lb.values(), key=lambda x: x.get('averageScore', 0) if isinstance(x, dict) else 0, reverse=True)
        
        print(f"\n🏆 لوحة المتصدرين ({len(ranking)} طالب):\n")
        print(f"{'#':<4} {'الاسم':<25} {'المعدل':<10} {'الامتحانات'}")
        print("─" * 55)
        for i, s in enumerate(ranking[:20], 1):
            if isinstance(s, dict):
                print(f"{i:<4} {s.get('fullName','?'):<25} {s.get('averageScore',0):<10}% {s.get('examsTaken',0)}")
    
    elif args.summary:
        students = db.reference('Students').get() or {}
        codes = db.reference('ActivationCodes').get() or {}
        exams = db.reference('Exams').get() or {}
        
        used_codes = sum(1 for v in codes.values() if isinstance(v, dict) and v.get('isUsed'))
        
        print("\n" + "="*40)
        print("📊 ملخص إحصائيات منصة ELKHETA")
        print("="*40)
        print(f"  👥 إجمالي الطلاب:          {len(students)}")
        print(f"  🔑 أكواد التفعيل الكلية:   {len(codes)}")
        print(f"  ✅ أكواد مستخدمة:          {used_codes}")
        print(f"  🔓 أكواد متاحة:            {len(codes) - used_codes}")
        print(f"  📚 مجموعات الامتحانات:     {len(exams)}")
        print("="*40)

# ─── CLI ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description='🎓 ELKHETA Platform Manager - أداة إدارة منصة الخطة التعليمية',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest='command')
    
    # Codes
    codes_p = subparsers.add_parser('codes', help='إدارة أكواد التفعيل')
    codes_g = codes_p.add_mutually_exclusive_group(required=True)
    codes_g.add_argument('--generate', type=int, metavar='N', help='توليد N كود جديد')
    codes_g.add_argument('--list', action='store_true', help='عرض جميع الأكواد')
    codes_g.add_argument('--delete-used', action='store_true', help='حذف الأكواد المستخدمة')
    codes_p.add_argument('--prefix', default='KH', help='مقدمة الكود (افتراضي: KH)')
    codes_p.set_defaults(func=cmd_codes)
    
    # Students
    students_p = subparsers.add_parser('students', help='إدارة الطلاب')
    students_g = students_p.add_mutually_exclusive_group(required=True)
    students_g.add_argument('--list', action='store_true', help='عرض قائمة الطلاب')
    students_g.add_argument('--export', action='store_true', help='تصدير الطلاب لـ Excel')
    students_g.add_argument('--delete-fake', action='store_true', help='حذف الحسابات الوهمية')
    students_g.add_argument('--stats-report', action='store_true', help='تقرير أفضل الطلاب')
    students_p.set_defaults(func=cmd_students)
    
    # Exams
    exams_p = subparsers.add_parser('exams', help='إدارة الامتحانات')
    exams_g = exams_p.add_mutually_exclusive_group(required=True)
    exams_g.add_argument('--list', action='store_true', help='عرض جميع الامتحانات')
    exams_g.add_argument('--delete-old', action='store_true', help='حذف الامتحانات القديمة')
    exams_p.set_defaults(func=cmd_exams)
    
    # Stats
    stats_p = subparsers.add_parser('stats', help='إحصائيات المنصة')
    stats_g = stats_p.add_mutually_exclusive_group(required=True)
    stats_g.add_argument('--leaderboard', action='store_true', help='لوحة المتصدرين')
    stats_g.add_argument('--summary', action='store_true', help='ملخص إحصائيات عام')
    stats_p.set_defaults(func=cmd_stats)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        print("""
─────────────────────────────────────────
أمثلة الاستخدام:

  توليد 50 كود تفعيل:
    python main.py codes --generate 50 --prefix KH

  تصدير بيانات الطلاب:
    python main.py students --export

  عرض لوحة المتصدرين:
    python main.py stats --leaderboard

  ملخص إحصائيات المنصة:
    python main.py stats --summary

  حذف الامتحانات القديمة:
    python main.py exams --delete-old
─────────────────────────────────────────
""")
        return
    
    if hasattr(args, 'func'):
        args.func(args)

if __name__ == '__main__':
    main()
