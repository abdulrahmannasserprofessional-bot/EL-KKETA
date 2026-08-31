<?php
/**
 * Header and Navigation Component
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$currentPage = basename($_SERVER['PHP_SELF']);
$adminUser = $_SESSION['admin_username'] ?? 'المدير';
$adminRole = $_SESSION['admin_role'] ?? 'super_admin';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? $pageTitle . ' - ' . APP_NAME : APP_NAME ?></title>
    
    <!-- الخطوط والأيقونات -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- مكتبة التنبيهات المتقدمة SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <style>
        :root {
            --primary: #2563EB;
            --primary-dark: #1D4ED8;
            --primary-light: #60A5FA;
            --accent: #4F46E5;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --bg-main: #F8FAFC;
            --bg-card: #FFFFFF;
            --text-main: #0F172A;
            --text-muted: #64748B;
            --border: #E2E8F0;
            --sidebar-width: 260px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Cairo', sans-serif;
        }

        body {
            background-color: var(--bg-main);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
        }

        /* ─── Sidebar ─── */
        .sidebar {
            width: var(--sidebar-width);
            background: #FFFFFF;
            border-left: 1px solid var(--border);
            height: 100vh;
            position: fixed;
            top: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            z-index: 100;
            box-shadow: -2px 0 10px rgba(0,0,0,0.02);
            transition: transform 0.3s ease;
        }

        .sidebar-brand {
            padding: 24px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border);
        }

        .brand-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: #FFFFFF;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
        }

        .brand-text h2 {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-main);
        }

        .brand-text span {
            font-size: 11px;
            color: var(--text-muted);
            display: block;
        }

        .sidebar-menu {
            flex: 1;
            padding: 20px 12px;
            list-style: none;
            overflow-y: auto;
        }

        .menu-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            padding: 10px 14px 6px;
            letter-spacing: 0.5px;
        }

        .menu-item {
            margin-bottom: 4px;
        }

        .menu-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: #475569;
            text-decoration: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .menu-link i {
            font-size: 18px;
            width: 24px;
            text-align: center;
            color: #94A3B8;
            transition: color 0.2s;
        }

        .menu-link:hover {
            background: #F1F5F9;
            color: var(--primary);
        }

        .menu-link:hover i {
            color: var(--primary);
        }

        .menu-link.active {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(79, 70, 229, 0.15));
            color: var(--primary);
            font-weight: 700;
        }

        .menu-link.active i {
            color: var(--primary);
        }

        .sidebar-footer {
            padding: 16px 20px;
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #F8FAFC;
        }

        .admin-profile {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .admin-avatar {
            width: 36px;
            height: 36px;
            background: #E2E8F0;
            color: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 15px;
        }

        .admin-info .name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }

        .admin-info .role {
            font-size: 10px;
            color: var(--text-muted);
        }

        .logout-btn {
            color: var(--danger);
            background: rgba(239, 68, 68, 0.1);
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: background 0.2s;
        }

        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.2);
        }

        /* ─── Main Content Area ─── */
        .main-wrapper {
            margin-right: var(--sidebar-width);
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            width: calc(100% - var(--sidebar-width));
        }

        .top-navbar {
            height: 70px;
            background: #FFFFFF;
            border-bottom: 1px solid var(--border);
            padding: 0 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .nav-title h1 {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .firebase-status-badge {
            background: #ECFDF5;
            color: #065F46;
            border: 1px solid #A7F3D0;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .firebase-dot {
            width: 8px;
            height: 8px;
            background: #10B981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }

        .content-body {
            padding: 30px;
            flex: 1;
        }

        /* ─── Cards & Grid ─── */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: #FFFFFF;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 22px;
            display: flex;
            align-items: center;
            gap: 18px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06);
        }

        .stat-icon-wrap {
            width: 54px;
            height: 54px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .stat-icon-blue { background: rgba(37, 99, 235, 0.12); color: var(--primary); }
        .stat-icon-green { background: rgba(16, 185, 129, 0.12); color: var(--success); }
        .stat-icon-amber { background: rgba(245, 158, 11, 0.12); color: var(--warning); }
        .stat-icon-purple { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }

        .stat-details h3 {
            font-size: 26px;
            font-weight: 900;
            color: var(--text-main);
            line-height: 1.1;
        }

        .stat-details p {
            font-size: 13px;
            color: var(--text-muted);
            margin-top: 4px;
            font-weight: 600;
        }

        .panel-card {
            background: #FFFFFF;
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
            margin-bottom: 30px;
            overflow: hidden;
        }

        .panel-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #FAFAFA;
        }

        .panel-title {
            font-size: 16px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .panel-body {
            padding: 24px;
        }

        /* ─── Buttons & Inputs ─── */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-primary {
            background: var(--primary);
            color: #FFFFFF;
        }
        .btn-primary:hover { background: var(--primary-dark); }

        .btn-success { background: var(--success); color: #FFFFFF; }
        .btn-danger { background: var(--danger); color: #FFFFFF; }
        .btn-secondary { background: #F1F5F9; color: #475569; }
        .btn-secondary:hover { background: #E2E8F0; }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid var(--border);
            border-radius: 10px;
            font-size: 14px;
            font-family: 'Cairo', sans-serif;
            outline: none;
            transition: border-color 0.2s;
        }

        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
        }

        /* ─── Table ─── */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
        }

        table.custom-table {
            width: 100%;
            border-collapse: collapse;
            text-align: right;
        }

        table.custom-table th {
            background: #F8FAFC;
            color: #475569;
            font-size: 13px;
            font-weight: 700;
            padding: 14px 18px;
            border-bottom: 1px solid var(--border);
        }

        table.custom-table td {
            padding: 16px 18px;
            font-size: 14px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }

        table.custom-table tr:hover td {
            background-color: #F8FAFC;
        }

        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
        }

        .badge-success { background: #DCFCE7; color: #15803D; }
        .badge-danger { background: #FEE2E2; color: #B91C1C; }
        .badge-warning { background: #FEF3C7; color: #B45309; }
        .badge-info { background: #E0E7FF; color: #4338CA; }

        .menu-toggle {
            display: none;
            background: none;
            border: none;
            font-size: 22px;
            color: var(--text-main);
            cursor: pointer;
        }

        @media (max-width: 992px) {
            .sidebar {
                transform: translateX(100%);
            }
            .sidebar.show {
                transform: translateX(0);
            }
            .main-wrapper {
                margin-right: 0;
                width: 100%;
            }
            .menu-toggle {
                display: block;
            }
        }
    </style>
</head>
<body>

    <!-- القائمة الجانبية (Sidebar) -->
    <aside class="sidebar" id="adminSidebar">
        <div class="sidebar-brand">
            <div class="brand-icon">
                <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="brand-text">
                <h2>منصة الخطة</h2>
                <span>لوحة التحكم المباشرة</span>
            </div>
        </div>

        <ul class="sidebar-menu">
            <div class="menu-title">الرئيسية والإحصائيات</div>
            <li class="menu-item">
                <a href="dashboard.php" class="menu-link <?= $currentPage === 'dashboard.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>نظرة عامة</span>
                </a>
            </li>

            <div class="menu-title">إدارة المنظومة التعليمية</div>
            <li class="menu-item">
                <a href="students.php" class="menu-link <?= $currentPage === 'students.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-user-graduate"></i>
                    <span>إدارة الطلاب</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="courses.php" class="menu-link <?= $currentPage === 'courses.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-book-bookmark"></i>
                    <span>الكورسات والمحاضرات</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="codes.php" class="menu-link <?= $currentPage === 'codes.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-ticket"></i>
                    <span>أكواد الشحن والتفعيل</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="exams.php" class="menu-link <?= $currentPage === 'exams.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-file-circle-question"></i>
                    <span>الامتحانات والواجبات</span>
                </a>
            </li>

            <div class="menu-title">التواصل والإعدادات</div>
            <li class="menu-item">
                <a href="notifications.php" class="menu-link <?= $currentPage === 'notifications.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-bell"></i>
                    <span>إرسال إشعارات للطلاب</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="settings.php" class="menu-link <?= $currentPage === 'settings.php' ? 'active' : '' ?>">
                    <i class="fa-solid fa-sliders"></i>
                    <span>إعدادات المنصة والسيرفر</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-footer">
            <div class="admin-profile">
                <div class="admin-avatar"><?= mb_substr($adminUser, 0, 1, 'UTF-8') ?></div>
                <div class="admin-info">
                    <div class="name"><?= htmlspecialchars($adminUser) ?></div>
                    <div class="role"><?= $adminRole === 'super_admin' ? 'مدير المنظومة' : 'مشرف' ?></div>
                </div>
            </div>
            <a href="logout.php" class="logout-btn" title="تسجيل الخروج">
                <i class="fa-solid fa-right-from-bracket"></i>
            </a>
        </div>
    </aside>

    <!-- مساحة المحتوى -->
    <div class="main-wrapper">
        <header class="top-navbar">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="menu-toggle" id="menuToggle">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div class="nav-title">
                    <h1><?= isset($pageTitle) ? $pageTitle : 'لوحة الإدارة' ?></h1>
                </div>
            </div>

            <div class="nav-actions">
                <div class="firebase-status-badge">
                    <span class="firebase-dot"></span>
                    <span>متصل بـ Firebase</span>
                </div>
            </div>
        </header>

        <main class="content-body">
