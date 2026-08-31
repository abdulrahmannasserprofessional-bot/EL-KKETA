<?php
/**
 * Admin Authentication & Session Management
 * إدارة جلسات الدخول والتحقق من صلاحيات المشرف
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/FirebaseService.php';

function checkAuth()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: index.php');
        exit;
    }
}

function verifyAdminLogin($username, $password)
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $username = trim($username);
    $password = trim($password);

    // 1. التحقق من الحساب الافتراضي
    if ($username === ADMIN_DEFAULT_USER && $password === ADMIN_DEFAULT_PASS) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_role'] = 'super_admin';
        return true;
    }

    // 2. التحقق من حسابات المشرفين المسجلة في Firebase
    $fb = new FirebaseService();
    $admins = $fb->get('Admins');
    if ($admins && is_array($admins)) {
        foreach ($admins as $id => $adm) {
            if (!empty($adm['username']) && $adm['username'] === $username) {
                if (!empty($adm['password']) && ($adm['password'] === $password || password_verify($password, $adm['password']))) {
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['admin_username'] = $username;
                    $_SESSION['admin_role'] = $adm['role'] ?? 'admin';
                    return true;
                }
            }
        }
    }

    $supervisors = $fb->get('Supervisors');
    if ($supervisors && is_array($supervisors)) {
        foreach ($supervisors as $id => $sup) {
            if (!empty($sup['username']) && $sup['username'] === $username) {
                if (!empty($sup['password']) && ($sup['password'] === $password || password_verify($password, $sup['password']))) {
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['admin_username'] = $username;
                    $_SESSION['admin_role'] = 'supervisor';
                    return true;
                }
            }
        }
    }

    return false;
}
