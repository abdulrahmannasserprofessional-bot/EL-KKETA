import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import json

# ========================================================
# إعدادات قاعدة البيانات (Firebase)
# ========================================================
FIREBASE_DB_URL = "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app"

# ========================================================
# إعدادات البريد الإلكتروني (المرسل)
# ========================================================
# الايميل الذي استخرجنا منه كلمة مرور التطبيقات
SENDER_EMAIL = "abdulrahman.nasser.professional@gmail.com" 
# كلمة مرور التطبيقات الخاصة بك
SENDER_PASSWORD = "gbvr nowp vvso brpf"

def send_email(to_email, to_name, otp_code):
    print(f"📩 جاري إرسال الإيميل إلى {to_email}...")
    
    subject = "كود التحقق الخاص بك - منصة الخطة التعليمية"
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; text-align: right; direction: rtl; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #3B82F6;">أهلاً بك يا {to_name} 👋</h2>
        <p style="font-size: 16px; color: #333;">لقد طلبت إنشاء حساب في منصة الخطة التعليمية.</p>
        <p style="font-size: 16px; color: #333;">كود التحقق الخاص بك هو:</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 2px dashed #8B5CF6; display: inline-block; font-size: 24px; font-weight: bold; color: #8B5CF6; letter-spacing: 5px;">
            {otp_code}
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 20px;">إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة.</p>
    </div>
    """

    msg = MIMEMultipart()
    msg['From'] = f"منصة الخطة التعليمية <{SENDER_EMAIL}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_body, 'html'))

    try:
        # الاتصال بسيرفر Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ تم إرسال الإيميل بنجاح إلى {to_email}")
        return True
    except Exception as e:
        print(f"❌ حدث خطأ أثناء إرسال الإيميل: {e}")
        return False

def check_queue():
    url = f"{FIREBASE_DB_URL}/MailQueue.json"
    try:
        response = requests.get(url)
        if response.status_code == 200 and response.json():
            queue = response.json()
            for req_id, req_data in queue.items():
                if req_data.get('status') == 'pending':
                    print(f"\n🔔 طلب جديد: {req_data['email']}")
                    
                    # إرسال الإيميل
                    success = send_email(
                        to_email=req_data['email'],
                        to_name=req_data['name'],
                        otp_code=req_data['code']
                    )
                    
                    if success:
                        # حذف الطلب من فايربيز بعد الإرسال بنجاح
                        delete_url = f"{FIREBASE_DB_URL}/MailQueue/{req_id}.json"
                        requests.delete(delete_url)
                        print(f"🗑️ تم حذف الطلب {req_id} من الطابور.")
    except Exception as e:
        print(f"⚠️ خطأ في الاتصال بقاعدة البيانات: {e}")

if __name__ == "__main__":
    print("🚀 خدمة إرسال الإيميلات تعمل الآن وتراقب الطلبات...")
    print("الخدمة تعمل على مدار الساعة.. اضغط Ctrl+C للإيقاف.\n")
    
    while True:
        check_queue()
        # ننتظر 3 ثواني بين كل فحص عشان منعملش ضغط على السيرفر
        time.sleep(3)
