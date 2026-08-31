import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ========================================================
# إعدادات قاعدة البيانات (Firebase)
# ========================================================
FIREBASE_DB_URL = "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app"

# ========================================================
# إعدادات البريد الإلكتروني (المرسل)
# ========================================================
# ضع هنا إيميل الـ Gmail الخاص بالمنصة
SENDER_EMAIL = "ضع_ايميل_المنصة_هنا@gmail.com"

# ضع هنا "كلمة مرور التطبيقات" (App Password) وليس الباسورد العادي
# (يجب تفعيل التحقق بخطوتين في جوجل لإنشاء App Password)
SENDER_PASSWORD = "ضع_كلمة_مرور_التطبيقات_هنا"

def get_registered_emails():
    """يجلب جميع الإيميلات المسجلة للطلاب من قاعدة البيانات"""
    print("⏳ جاري الاتصال بقاعدة البيانات لجلب إيميلات الطلاب...")
    url = f"{FIREBASE_DB_URL}/Students.json"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if not data:
            print("❌ لا يوجد طلاب مسجلين في قاعدة البيانات.")
            return []
            
        emails = []
        for student_code, student_info in data.items():
            email = student_info.get("email")
            if email and "@" in email:  # تحقق بسيط من صحة الإيميل
                emails.append(email)
                
        # إزالة التكرار إن وجد
        emails = list(set(emails))
        print(f"✅ تم العثور على {len(emails)} إيميل مسجل.")
        return emails
        
    except Exception as e:
        print(f"❌ حدث خطأ أثناء جلب البيانات: {e}")
        return []

def send_emails(recipients, subject, message_body):
    """يرسل الإيميل لجميع الطلاب"""
    print("\n⏳ جاري تجهيز الخادم لإرسال الإيميلات...")
    
    # إعداد خادم SMTP الخاص بجوجل
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    
    try:
        # الاتصال بالخادم
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # تشفير الاتصال
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        success_count = 0
        fail_count = 0
        
        print("\n🚀 جاري الإرسال...")
        for recipient_email in recipients:
            try:
                # تجهيز الرسالة
                msg = MIMEMultipart()
                msg['From'] = f"منصة الخطة <{SENDER_EMAIL}>"
                msg['To'] = recipient_email
                msg['Subject'] = subject
                
                # إضافة المحتوى
                msg.attach(MIMEText(message_body, 'html', 'utf-8'))
                
                # إرسال الرسالة
                server.send_message(msg)
                success_count += 1
                print(f"✔️ تم الإرسال بنجاح إلى: {recipient_email}")
                
            except Exception as e:
                fail_count += 1
                print(f"❌ فشل الإرسال إلى {recipient_email}: {e}")
                
        server.quit()
        print("\n==================================")
        print(f"✅ انتهت العملية!")
        print(f"✔️ نجح: {success_count}")
        print(f"❌ فشل: {fail_count}")
        print("==================================")
        
    except Exception as e:
        print(f"❌ فشل الاتصال بخادم البريد الإلكتروني. تأكد من الإيميل والباسورد الخاص بالتطبيقات.")
        print(f"الخطأ: {e}")

if __name__ == "__main__":
    print("==================================")
    print("أداة إرسال الإشعارات لطلاب منصة الخطة")
    print("==================================\n")
    
    # 1. جلب الإيميلات
    student_emails = get_registered_emails()
    
    if not student_emails:
        input("اضغط Enter للخروج...")
        exit()
        
    # 2. طلب تفاصيل الرسالة من الإدمن
    print("\n----------------------------------")
    email_subject = input("📝 أدخل عنوان الإيميل (Subject): ")
    
    print("\n📝 أدخل نص الرسالة (يمكنك استخدام HTML).")
    print("اضغط على Enter مرتين متتاليتين للانتهاء من الكتابة:")
    
    message_lines = []
    while True:
        line = input()
        if not line:
            break
        message_lines.append(line)
        
    email_body = "<br>".join(message_lines)
    
    # إضافة تنسيق جميل للرسالة
    full_html_message = f"""
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #4F46E5; text-align: center;">جديد منصة الخطة 🚀</h2>
        <div style="font-size: 16px;">
            {email_body}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; font-size: 12px; color: #888;">
            هذه رسالة تلقائية من منصة الخطة. يرجى عدم الرد عليها.
        </p>
    </div>
    """
    
    # 3. التأكيد قبل الإرسال
    print(f"\nسيتم إرسال هذا الإيميل إلى {len(student_emails)} طالب.")
    confirm = input("هل أنت متأكد من الإرسال؟ (نعم/لا): ")
    
    if confirm.strip() in ['نعم', 'y', 'yes', '1']:
        send_emails(student_emails, email_subject, full_html_message)
    else:
        print("تم إلغاء الإرسال.")
    
    input("\nاضغط Enter للخروج...")
