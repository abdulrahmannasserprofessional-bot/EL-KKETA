const nodemailer = require('nodemailer');

// Set up CORS helper
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create transporter using environment variables (or hardcoded for now since it's just the user's setup)
  // For Vercel, it's better to use environment variables: process.env.EMAIL and process.env.PASSWORD
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'abdulrahman.nasser.professional@gmail.com',
      pass: 'gbvr nowp vvso brpf',
    },
  });

  const htmlBody = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز التحقق - منصة الخطة التعليمية</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #05070c;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      direction: rtl;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 15px;
    }
    .card-wrapper {
      width: 100%;
      max-width: 400px;
      background: linear-gradient(180deg, #121c2e 0%, #080d16 100%);
      border: 1.5px solid rgba(216, 178, 136, 0.35);
      border-radius: 28px;
      padding: 30px 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      text-align: center;
    }
    .header-title {
      font-size: 21px;
      font-weight: 800;
      color: #dfb788;
      margin-bottom: 2px;
    }
    .header-sub {
      font-size: 10.5px;
      color: #9d7b56;
      letter-spacing: 2px;
      font-weight: 700;
      margin-bottom: 22px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .message-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      padding: 0 5px;
      margin-bottom: 20px;
    }
    .otp-container {
      background: rgba(6, 10, 18, 0.85);
      border: 1px solid rgba(216, 178, 136, 0.25);
      border-radius: 18px;
      padding: 20px 12px 24px;
      margin-bottom: 20px;
      box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6);
    }
    .otp-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #c99e6b;
      margin-bottom: 16px;
    }
    .otp-grid {
      display: flex;
      justify-content: center;
      align-items: center;
      direction: ltr;
    }
    
    /* تنسيق مميز للأرقام والمربعات */
    .otp-box {
      width: 54px;
      height: 66px;
      margin: 0 5px;
      background: radial-gradient(circle at 50% 30%, #1e2c45 0%, #0d1522 100%);
      border: 1.8px solid #f6c875;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 0 8px rgba(246, 200, 117, 0.2);
      overflow: hidden;
      flex-shrink: 0;
    }

    /* نص الرقم المتوهج */
    .otp-digit-text {
      font-size: 32px;
      font-weight: 900;
      font-family: 'Consolas', 'Courier New', monospace, sans-serif;
      background: linear-gradient(180deg, #ffffff 10%, #ffd066 50%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 6px rgba(245, 158, 11, 0.5));
    }

    .alert-card {
      background: linear-gradient(135deg, #a77749 0%, #6e411f 100%);
      border-radius: 14px;
      padding: 12px 14px;
      color: #ffffff;
      margin-bottom: 20px;
    }
    .alert-header {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 3px;
      color: #fff;
    }
    .alert-subtext {
      font-size: 11.5px;
      color: #fcefe3;
      line-height: 1.4;
    }
    .footer-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .ep-badge {
      width: 40px;
      height: 40px;
      line-height: 38px;
      border: 1.5px solid rgba(201, 158, 107, 0.4);
      border-radius: 10px;
      color: #c99e6b;
      font-size: 14px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .footer-auth {
      font-size: 9.5px;
      color: #c99e6b;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .footer-copy {
      font-size: 10px;
      color: #5d6878;
    }
  </style>
</head>
<body>

  <div class="card-wrapper">
    <div class="header-title">منصة الخطة التعليمية</div>
    <div class="header-sub">ELKHETA PLATFORM 2026</div>

    <div class="greeting">مرحباً ${name || 'بك'} 👋</div>
    
    <p class="message-text">
      تلقينا طلباً للتحقق من حسابك في منصة الخطة، يرجى استخدام رمز الأمان السريع التالي لإتمام تسجيل الدخول:
    </p>

    <div class="otp-container">
      <div class="otp-label">رمز التحقق السريع</div>
      <div class="otp-grid">
        <div class="otp-box"><span class="otp-digit-text">${code[0]}</span></div>
        <div class="otp-box"><span class="otp-digit-text">${code[1]}</span></div>
        <div class="otp-box"><span class="otp-digit-text">${code[2]}</span></div>
        <div class="otp-box"><span class="otp-digit-text">${code[3]}</span></div>
      </div>
    </div>

    <div class="alert-card">
      <div class="alert-header">🛡️ صلاحية الرمز 5 دقائق فقط.</div>
      <div class="alert-subtext">لا تشارك هذا الرمز السري مع أي شخص للحفاظ على أمان حسابك.</div>
    </div>

    <div class="footer-section">
      <div class="ep-badge">EP</div>
      <div class="footer-auth">SECURED AUTHENTICATION SYSTEM © 2026</div>
      <div class="footer-copy">جميع الحقوق محفوظة لمنصة الخطة التعليمية</div>
    </div>
  </div>

</body>
</html>`;

  try {
    await transporter.sendMail({
      from: '"منصة الخطة التعليمية" <abdulrahman.nasser.professional@gmail.com>',
      to: email,
      subject: 'كود التحقق الخاص بك - منصة الخطة التعليمية',
      html: htmlBody,
    });
    
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
};

module.exports = allowCors(handler);
