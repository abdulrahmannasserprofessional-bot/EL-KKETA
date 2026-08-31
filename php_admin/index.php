<?php
/**
 * Admin Login Page
 * صفحة تسجيل الدخول للوحة التحكم
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        if (verifyAdminLogin($username, $password)) {
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'اسم المستخدم أو كلمة المرور غير صحيحة!';
        }
    } else {
        $error = 'يرجى إدخال جميع الحقول المطلوبة.';
    }
}

// إذا كان مسجل دخوله بالفعل يحول للوحة التحكم
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - <?= APP_NAME ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        body {
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            background: #FFFFFF;
            width: 100%;
            max-width: 420px;
            border-radius: 24px;
            padding: 40px 30px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
        }
        .brand-icon {
            width: 68px;
            height: 68px;
            background: linear-gradient(135deg, #2563EB, #4F46E5);
            color: #FFFFFF;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin: 0 auto 20px;
            box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }
        h2 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        p.subtitle { font-size: 13px; color: #64748B; margin-bottom: 28px; }
        .form-group { text-align: right; margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .input-wrap { position: relative; }
        .input-wrap i { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 16px; }
        .form-control {
            width: 100%;
            padding: 13px 44px 13px 16px;
            border: 1.5px solid #E2E8F0;
            border-radius: 12px;
            font-size: 14px;
            font-family: 'Cairo', sans-serif;
            outline: none;
            transition: all 0.2s;
        }
        .form-control:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.1s, box-shadow 0.2s;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
            margin-top: 10px;
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35); }
        .error-box {
            background: #FEE2E2;
            color: #B91C1C;
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <h2>منصة الخطة التعليمية</h2>
        <p class="subtitle">تسجيل الدخول إلى لوحة إدارة السيرفر و Firebase</p>

        <?php if (!empty($error)): ?>
            <div class="error-box">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <form method="POST" action="index.php">
            <div class="form-group">
                <label class="form-label">اسم المستخدم</label>
                <div class="input-wrap">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" name="username" class="form-control" placeholder="أدخل اسم المستخدم" required value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">كلمة المرور</label>
                <div class="input-wrap">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                </div>
            </div>

            <button type="submit" class="btn-submit">
                تسجيل الدخول <i class="fa-solid fa-arrow-left" style="margin-right: 6px;"></i>
            </button>
        </form>
    </div>

</body>
</html>
