-- ===================================================
-- ELKHETA Platform - MySQL Database Schema
-- قاعدة بيانات منصة الخطة التعليمية المتكاملة
-- ===================================================

CREATE DATABASE IF NOT EXISTS `elkheta_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `elkheta_db`;

-- 1. جدول المشرفين والمديرين (Admins & Supervisors)
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin', 'supervisor') DEFAULT 'supervisor',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول الطلاب والمستخدمين (Students)
CREATE TABLE IF NOT EXISTS `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(50) UNIQUE NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `parent_phone` VARCHAR(20) DEFAULT NULL,
    `grade` VARCHAR(50) DEFAULT 'الصف الثالث الثانوي',
    `device_id` VARCHAR(255) DEFAULT NULL,
    `is_banned` BOOLEAN DEFAULT FALSE,
    `wallet_balance` DECIMAL(10,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_student_code` (`student_code`),
    INDEX `idx_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول الكورسات والمحاضرات (Lectures & Courses)
CREATE TABLE IF NOT EXISTS `lectures` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `grade` VARCHAR(50) NOT NULL,
    `video_url` TEXT DEFAULT NULL,
    `pdf_url` TEXT DEFAULT NULL,
    `price` DECIMAL(10,2) DEFAULT 0.00,
    `is_free` BOOLEAN DEFAULT FALSE,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_lecture_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول أكواد الشحن والتفعيل (Recharge & Activation Codes)
CREATE TABLE IF NOT EXISTS `recharge_codes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE NOT NULL,
    `type` ENUM('wallet', 'course', 'term') DEFAULT 'wallet',
    `value` DECIMAL(10,2) DEFAULT 0.00,
    `is_used` BOOLEAN DEFAULT FALSE,
    `used_by_student_code` VARCHAR(50) DEFAULT NULL,
    `used_at` TIMESTAMP NULL DEFAULT NULL,
    `notes` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_code` (`code`),
    INDEX `idx_is_used` (`is_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول الامتحانات والواجبات (Exams)
CREATE TABLE IF NOT EXISTS `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `grade` VARCHAR(50) NOT NULL,
    `duration_minutes` INT DEFAULT 45,
    `total_marks` INT DEFAULT 100,
    `lecture_id` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_exam_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول أسئلة الامتحانات (Questions MCQ)
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) NOT NULL,
    `option_d` VARCHAR(255) NOT NULL,
    `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `explanation` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول درجات وتسليمات الطلاب (Exam Results)
CREATE TABLE IF NOT EXISTS `exam_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(50) NOT NULL,
    `exam_id` INT NOT NULL,
    `score` INT NOT NULL,
    `total_marks` INT NOT NULL,
    `answers_json` JSON DEFAULT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    INDEX `idx_result_student` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. جدول الإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `target_grade` VARCHAR(50) DEFAULT 'all',
    `link` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. جدول إعدادات المنصة والبوابة (Platform Settings)
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT PRIMARY KEY DEFAULT 1,
    `is_maintenance` BOOLEAN DEFAULT FALSE,
    `maintenance_message` TEXT DEFAULT NULL,
    `support_whatsapp` VARCHAR(50) DEFAULT NULL,
    `min_app_version` VARCHAR(20) DEFAULT '1.0.0',
    `notice_bar` VARCHAR(255) DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدخال الإعدادات الافتراضية والحساب الإداري
INSERT INTO `settings` (`id`, `is_maintenance`, `maintenance_message`, `support_whatsapp`, `min_app_version`, `notice_bar`)
VALUES (1, FALSE, 'المنصة تحت الصيانة والتحديث حالياً', '201000000000', '1.0.0', 'مرحباً بكم في منصة الخطة التعليمية ✨')
ON DUPLICATE KEY UPDATE `id`=1;

-- كلمة مرور المشرف الافتراضية: admin123456
INSERT INTO `admins` (`username`, `password`, `role`)
VALUES ('admin', '$2a$10$7vH8O14H6s2aX1h/Xq9vZe6fH3N2sQ4nF2k0lM7p1uO8w9j1a2b3c', 'super_admin')
ON DUPLICATE KEY UPDATE `username`='admin';
