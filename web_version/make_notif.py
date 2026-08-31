content = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إرسال إشعارات - ELKHETA Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #0984E3; --bg: #F8FAFC; --surface: #FFFFFF; --text-main: #1E293B; --text-sub: #64748B; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        body { background-color: var(--bg); color: var(--text-main); min-height: 100vh; padding-bottom: 50px; }
        .header { background: linear-gradient(135deg, #0984E3, #00b894); padding: 25px 20px; color: white; border-radius: 0 0 24px 24px; box-shadow: 0 10px 25px rgba(9,132,227,0.2); margin-bottom: 30px; }
        .header-top { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
        .back-btn { background: rgba(255,255,255,0.2); color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 20px; backdrop-filter: blur(5px); }
        .header h1 { font-size: 22px; font-weight: 800; }
        .container { padding: 0 20px; max-width: 800px; margin: 0 auto; }
        .card { background: var(--surface); border-radius: 20px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 14px; color: #334155; }
        .form-input { width: 100%; padding: 14px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--primary); }
        .btn-submit { width: 100%; padding: 16px; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px rgba(99,102,241,0.3); transition: transform 0.2s; }
        .btn-submit:active { transform: scale(0.98); }
        #toast { visibility: hidden; min-width: 260px; background: white; color: #2D3436; text-align: center; border-radius: 16px; padding: 14px 20px; position: fixed; z-index: 999; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); opacity: 0; transition: all 0.35s; font-size: 15px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.12); border-bottom: 4px solid #0984E3; }
        #toast.show { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(0); }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-top">
            <a href="admin-panel.html" class="back-btn">➔</a>
            <h1>إرسال إشعارات للطلاب 🔔</h1>
        </div>
        <p style="opacity: 0.9; font-size: 13px; margin-right: 55px;">إرسال إشعار مباشر لجميع الطلاب عبر المتصفح والموبايل</p>
    </div>

    <div class="container">
        <div class="card">
            <div class="form-group">
                <label class="form-label">عنوان الإشعار</label>
                <input type="text" id="notifTitle" class="form-input" placeholder="مثال: تم إضافة محاضرة جديدة! ✨">
            </div>
            <div class="form-group">
                <label class="form-label">محتوى الإشعار</label>
                <textarea id="notifBody" class="form-input" style="min-height: 100px; resize: vertical;" placeholder="مثال: ادخل الآن لمشاهدة محاضرة الفصل الأول... "></textarea>
            </div>

            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <label class="form-label" style="color: #166534;">🔑 ملف مفتاح الخدمة (Service Account JSON)</label>
                <p style="font-size: 11px; color: #15803D; margin-bottom: 10px;">احصل عليه من (Firebase Console > Project Settings > Service accounts > Generate new private key). ثم قم بلصق الكود هنا.</p>
                <textarea id="serverKey" class="form-input" style="background: #ffffff; border-color: #86EFAC; font-family: monospace; direction: ltr; text-align: left; min-height: 100px; font-size: 10px;" placeholder='{ "type": "service_account", ... }'></textarea>
            </div>

            <button class="btn-submit" onclick="sendNotification()">🚀 إرسال الإشعار لجميع الطلاب</button>
        </div>
    </div>

    <div id="toast"></div>

    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/10.9.0/jsrsasign-all-min.js"></script>
    <script src="firebase-config.js"></script>
    <script>
        window.onload = () => {
            const savedKey = localStorage.getItem('fcmServiceAccount');
            if(savedKey) document.getElementById('serverKey').value = savedKey;
        };

        function showToast(message, type = "info") {
            const toast = document.getElementById("toast");
            toast.innerHTML = message;
            if (type === 'success') toast.style.borderBottomColor = '#00B894';
            else if (type === 'error') toast.style.borderBottomColor = '#D63031';
            toast.className = "show";
            setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
        }

        async function getAccessToken(serviceAccountJson) {
            try {
                const creds = JSON.parse(serviceAccountJson);
                const header = { alg: 'RS256', typ: 'JWT' };
                const now = Math.floor(Date.now() / 1000);
                const claim = {
                    iss: creds.client_email,
                    scope: 'https://www.googleapis.com/auth/firebase.messaging',
                    aud: 'https://oauth2.googleapis.com/token',
                    exp: now + 3600,
                    iat: now
                };
                
                const sHeader = JSON.stringify(header);
                const sClaim = JSON.stringify(claim);
                const sJWT = KJUR.jws.JWS.sign(null, sHeader, sClaim, creds.private_key);

                const res = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + sJWT
                });
                const data = await res.json();
                if(data.access_token) {
                    return { token: data.access_token, projectId: creds.project_id };
                } else {
                    throw new Error("فشل في الحصول على الـ Token");
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        }

        async function sendNotification() {
            const title = document.getElementById('notifTitle').value.trim();
            const body = document.getElementById('notifBody').value.trim();
            const serviceKeyStr = document.getElementById('serverKey').value.trim();

            if(!title || !body) return showToast("يرجى كتابة العنوان والمحتوى", "error");
            if(!serviceKeyStr) return showToast("يرجى إدخال ملف Service Account", "error");

            const btn = document.querySelector('.btn-submit');
            btn.innerText = "جاري الاتصال بجوجل...";
            btn.style.opacity = "0.7";

            localStorage.setItem('fcmServiceAccount', serviceKeyStr);

            try {
                // 1. Fetch OAuth Token
                const authData = await getAccessToken(serviceKeyStr);
                if(!authData) {
                    btn.innerText = "🚀 إرسال الإشعار لجميع الطلاب";
                    btn.style.opacity = "1";
                    return showToast("ملف الـ JSON الخاص بـ Service Account غير صحيح", "error");
                }

                btn.innerText = "جاري إرسال الإشعارات...";

                // 2. Fetch all tokens
                const snap = await database.ref('PushTokens').once('value');
                if(!snap.exists()) {
                    showToast("لا يوجد طلاب مشتركين في الإشعارات بعد!", "error");
                    btn.innerText = "🚀 إرسال الإشعار لجميع الطلاب";
                    btn.style.opacity = "1";
                    return;
                }

                const tokens = Object.keys(snap.val());
                let successCount = 0;

                // 3. Send via FCM v1 API (Must send individually or via topics, v1 doesn't support bulk array in the same way, but we will loop them as there is no backend)
                // Note: v1 allows only 1 token per request for direct messages
                const sendPromises = tokens.map(async (token) => {
                    const response = await fetch('https://fcm.googleapis.com/v1/projects/' + authData.projectId + '/messages:send', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + authData.token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: {
                                token: token,
                                notification: {
                                    title: title,
                                    body: body,
                                }
                            }
                        })
                    });
                    if(response.ok) successCount++;
                });

                await Promise.allSettled(sendPromises);

                showToast("تم إرسال الإشعار بنجاح لـ " + successCount + " طالب! 🎉", "success");
                document.getElementById('notifTitle').value = "";
                document.getElementById('notifBody').value = "";

            } catch(e) {
                console.error(e);
                showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
            }

            btn.innerText = "🚀 إرسال الإشعار لجميع الطلاب";
            btn.style.opacity = "1";
        }
    </script>
</body>
</html>'''
open('admin-notifications.html', 'w', encoding='utf-8').write(content)
