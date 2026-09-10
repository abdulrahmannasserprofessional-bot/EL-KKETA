const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const studentsController = require('../controllers/studentsController');
const lecturesController = require('../controllers/lecturesController');
const codesController = require('../controllers/codesController');
const examsController = require('../controllers/examsController');
const settingsController = require('../controllers/settingsController');
const activityController = require('../controllers/activityController');
const verifyController = require('../controllers/verifyController');
const supportController = require('../controllers/supportController');

// 1. مسارات المصادقة والتسجيل (Auth)
router.post('/auth/admin/login', authController.adminLogin);
router.post('/auth/student', authController.studentAuth);
router.post('/auth/verify-supervisor-pin', verifyController.verifySupervisorPin);
router.post('/auth/check-activation-code', verifyController.checkActivationCode);
router.get('/auth/migrate-supervisors', verifyController.migrateSupervisors);
router.post('/auth/setup-activation-table', verifyController.setupActivationTable);

// 2. مسارات إدارة الطلاب (Students)
router.get('/students', studentsController.getStudents);
router.post('/students/toggle-ban', studentsController.toggleBan);
router.post('/students/reset-device', studentsController.resetDevice);
router.post('/students/update', studentsController.updateStudent);
router.post('/students/recharge-wallet', studentsController.rechargeStudentWallet);
router.delete('/students/:student_code', studentsController.deleteStudent);

// 3. مسارات مراقبة الأجهزة والنشاط الحي (Activity Monitoring)
router.post('/activity/log', activityController.logActivity);
router.get('/activity/logs', activityController.getActivityLogs);
router.get('/activity/live', activityController.getLiveActiveStudents);
router.delete('/activity/logs', activityController.clearActivityLogs);

// 3. مسارات الكورسات والمحاضرات (Lectures)
router.get('/lectures', lecturesController.getLectures);
router.post('/lectures/save', lecturesController.saveLecture);
router.delete('/lectures/:id', lecturesController.deleteLecture);

// 4. مسارات أكواد الشحن (Codes)
router.get('/codes', codesController.getCodes);
router.post('/codes/generate', codesController.generateBulkCodes);
router.post('/codes/redeem', codesController.redeemCode);
router.delete('/codes/clear-used', codesController.clearUsedCodes);
router.delete('/codes/:id', codesController.deleteCode);

// 5. مسارات الامتحانات (Exams)
router.get('/exams', examsController.getExams);
router.post('/exams/save', examsController.saveExam);
router.post('/exams/submit', examsController.submitExam);
router.delete('/exams/:id', examsController.deleteExam);

// 6. مسارات الإعدادات والمشرفين وفحص السيرفر (Settings & Supervisors)
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSettings);
router.get('/supervisors', settingsController.getSupervisors);
router.post('/supervisors', settingsController.addSupervisor);
router.delete('/supervisors/:id', settingsController.deleteSupervisor);
// 7. مسارات تذاكر الدعم الفني (Support Tickets)
router.post('/support/tickets', supportController.createTicket);
router.get('/support/tickets', supportController.getTickets);
router.post('/support/tickets/reply', supportController.replyTicket);
router.delete('/support/tickets/:id', supportController.deleteTicket);

module.exports = router;
