/**
 * ══════════════════════════════════════════════════════════════════════
 * 🎫 ELKHETA AUTOMATED ACADEMIC RETAKE PERMISSION SYSTEM (ZERO CODE)
 * نظام أتمتة تصريح إعادة حل الامتحان الفوري عبر الدعم الأكاديمي (بدون أكواد)
 * تفعيل فوري 100% بكود الطالب المعتمد وبدون أي تدخل بشري
 * ══════════════════════════════════════════════════════════════════════
 */

(function (window) {
    'use strict';

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Real curriculum subjects of ELKHETA (Social Work & Humanities)
    const REAL_SUBJECTS = [
        "طريقة العمل مع الأفراد",
        "طريقة العمل مع الجماعات",
        "تنظيم وإدارة المجتمعات",
        "سياسات الرعاية والتشريعات الاجتماعية",
        "الخدمة الاجتماعية في المجال الطبي والتأهيلي",
        "التدريب الميداني والتطبيقي",
        "مشروع التخرج والبحث التطبيقي"
    ];

    const ExamRetakeGuard = {
        activePermissions: {},

        // 1. Get Firebase DB reference
        getDB: function () {
            return window.database || (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
        },

        // 2. Get current student data
        getStudent: function () {
            let user = {};
            try {
                user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || sessionStorage.getItem('studentData') || localStorage.getItem('studentData') || '{}');
            } catch (e) { }

            const rawCode = localStorage.getItem('studentCode') || user.studentCode || user.student_code || user.code || '';
            const studentCode = String(rawCode).trim().toUpperCase().replace(/[.#$\[\]]/g, '_');
            const studentName = user.fullName || user.full_name || user.name || 'طالب منصة الخطة';
            const studentPhone = user.phone || user.mobile || '';

            return { studentCode, studentName, studentPhone, isGuest: !studentCode };
        },

        // 3. Normalize Exam Identifier
        normalizeExamId: function (exam) {
            if (!exam) return 'exam_default';
            if (typeof exam === 'string') return exam.trim().replace(/[.#$\[\]/]/g, '_');
            const rawId = exam.id || exam.examId || exam.lessonId || exam.title || 'exam_default';
            return String(rawId).trim().replace(/[.#$\[\]/]/g, '_');
        },

        // 4. Check whether student has an active retake permission or has attempted the exam
        checkHasAttempted: async function (exam) {
            const student = this.getStudent();
            if (!student.studentCode) return false;

            const examId = this.normalizeExamId(exam);
            const db = this.getDB();

            // A. Check if there is an ACTIVE retake permission already granted!
            // 1. Local Cache check
            const localPerm = localStorage.getItem('retake_permission_' + examId);
            if (localPerm === 'active') {
                return false; // Permitted! Exam unlocked!
            }

            // 2. Firebase Active Permission check
            if (db) {
                try {
                    const permSnap = await db.ref(`ExamRetakePermissions/${student.studentCode}_${examId}`).once('value');
                    if (permSnap.exists()) {
                        const val = permSnap.val() || {};
                        if (val.status === 'active') {
                            localStorage.setItem('retake_permission_' + examId, 'active');
                            localStorage.removeItem('completed_exam_' + examId);
                            return false; // Permitted!
                        }
                    }

                    const stPermSnap = await db.ref(`Students/${student.studentCode}/retakePermissions/${examId}`).once('value');
                    if (stPermSnap.exists()) {
                        const val = stPermSnap.val() || {};
                        if (val.status === 'active') {
                            localStorage.setItem('retake_permission_' + examId, 'active');
                            localStorage.removeItem('completed_exam_' + examId);
                            return false; // Permitted!
                        }
                    }
                } catch (e) { }
            }

            // B. If NO active permission, check if exam was attempted before
            if (localStorage.getItem('completed_exam_' + examId)) {
                return true; // Locked, requires retake permission!
            }

            if (!db) return false;

            try {
                const subSnap = await db.ref(`Students/${student.studentCode}/exams/${examId}`).once('value');
                if (subSnap.exists()) {
                    localStorage.setItem('completed_exam_' + examId, 'true');
                    return true; // Locked, requires retake permission!
                }
            } catch (e) { }

            return false;
        },

        // 5. Grant Automated Retake Permission (NO CODES - 100% AUTOMATED VIA ACADEMIC SUPPORT)
        grantAutomatedRetakePermission: async function (studentCode, examId, subjectName, examTitle) {
            const student = this.getStudent();
            const safeStudent = studentCode || student.studentCode || 'STUDENT';
            const safeExamId = this.normalizeExamId(examId);
            const safeTitle = (examTitle || 'امتحان تقييمي').replace(/^(📝\s*|امتحان\s*:\s*|امتحان\s+)+/gi, '').trim();
            const safeSubj = subjectName || 'مقرر دراسي';
            const now = Date.now();

            const permissionRecord = {
                studentCode: safeStudent,
                studentName: student.studentName || 'طالب الخطة',
                examId: safeExamId,
                examTitle: safeTitle,
                subjectName: safeSubj,
                status: 'active',
                grantedAt: now,
                automated: true,
                grantedBy: 'الدعم الأكاديمي الآلي 🤖'
            };

            // 1. Save in local storage & memory
            this.activePermissions[safeExamId] = permissionRecord;
            try {
                localStorage.setItem('retake_permission_' + safeExamId, 'active');
                localStorage.setItem('retake_permission_data_' + safeExamId, JSON.stringify(permissionRecord));
                localStorage.removeItem('completed_exam_' + safeExamId);
            } catch (e) { }

            // 2. Sync to Firebase RTDB
            const db = this.getDB();
            if (db && safeStudent) {
                try {
                    await db.ref(`ExamRetakePermissions/${safeStudent}_${safeExamId}`).set(permissionRecord);
                    await db.ref(`Students/${safeStudent}/retakePermissions/${safeExamId}`).set(permissionRecord);

                    // Push formal student request into chat stream
                    await db.ref(`DirectChats/${safeStudent}/messages`).push({
                        sender: 'student',
                        senderName: student.studentName,
                        senderCode: safeStudent,
                        text: `[طلب إعادة حل امتحان]: أطلب إعادة حل امتحان "${safeTitle}" لمقرر "${safeSubj}" (كود الطالب: ${safeStudent})`,
                        topic: 'إعادة امتحان',
                        timestamp: now,
                        status: 'sent'
                    });

                    // Push automated instant Academic Support Bot confirmation into chat stream
                    await db.ref(`DirectChats/${safeStudent}/messages`).push({
                        sender: 'bot',
                        senderName: 'الدعم الأكاديمي المعتمد 🤖',
                        text: `✅ [الدعم الأكاديمي 🤖]: مرحباً بك يا ${student.studentName}! تم فتح وإتاحة إعادة حل امتحان "${safeTitle}" لمقرر "${safeSubj}" فورياً وتلقائياً بنجاح بدون أي كود وبدون أي تدخل بشري. نتمنى لك التوفيق وتحقيق الدرجة النهائية! 🌟`,
                        topic: 'إعادة امتحان',
                        tag: 'إعادة امتحان',
                        timestamp: now + 50,
                        status: 'sent'
                    });

                    // Update ticket meta
                    db.ref(`DirectChats/${safeStudent}/meta`).transaction((current) => {
                        const prev = current || {};
                        return {
                            ...prev,
                            studentCode: safeStudent,
                            studentName: student.studentName,
                            lastMessage: `✅ تم فتح إعادة حل امتحان: ${safeTitle}`,
                            lastTimestamp: now + 50,
                            status: 'open',
                            unreadForStudent: 0
                        };
                    });
                } catch (err) {
                    console.warn('Firebase retake sync notice:', err);
                }
            }

            return permissionRecord;
        },

        // Alias for backward compatibility
        grantRetakePermission: function (studentCode, examId, safeTitle, durationMinutes) {
            return this.grantAutomatedRetakePermission(studentCode, examId, 'مقرر دراسي', safeTitle);
        },

        // 6. Mark retake permission as used upon exam submission
        markRetakePermissionUsed: function (studentCode, examId) {
            const safeExamId = this.normalizeExamId(examId);
            delete this.activePermissions[safeExamId];
            try {
                localStorage.removeItem('retake_permission_' + safeExamId);
                localStorage.removeItem('retake_permission_data_' + safeExamId);
                localStorage.setItem('completed_exam_' + safeExamId, 'true');
            } catch (e) { }

            const db = this.getDB();
            if (db && studentCode) {
                db.ref(`ExamRetakePermissions/${studentCode}_${safeExamId}`).update({
                    status: 'used',
                    usedAt: Date.now()
                }).catch(() => { });

                db.ref(`Students/${studentCode}/retakePermissions/${safeExamId}`).update({
                    status: 'used',
                    usedAt: Date.now()
                }).catch(() => { });
            }
        },

        // 7. Fullscreen Helpers (Disabled for universal responsive view)
        openFullscreen: function (element) {
            // Disabled per user preference for smooth multi-device experience
        },

        exitFullscreen: function () {
            try {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } catch (e) {}
        },

        toggleFullscreen: function () {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
                this.openFullscreen(document.documentElement);
            } else {
                this.exitFullscreen();
            }
        },

        // 8. Inject Modern Modal Styles
        injectStyles: function () {
            if (document.getElementById('retakeGuardStylesV3')) return;
            const style = document.createElement('style');
            style.id = 'retakeGuardStylesV3';
            style.innerHTML = `
                .swal2-container {
                    z-index: 10000000 !important;
                }
                .retake-v3-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(7, 9, 15, 0.88);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.25s ease;
                    font-family: 'Cairo', sans-serif;
                    direction: rtl;
                }
                .retake-v3-backdrop.active {
                    opacity: 1;
                    pointer-events: auto;
                }
                .retake-v3-modal {
                    background: #0F172A;
                    border: 1.5px solid rgba(212, 151, 59, 0.45);
                    border-radius: 26px;
                    width: 100%;
                    max-width: 520px;
                    max-height: 92vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 151, 59, 0.22);
                    color: #F8FAFC;
                    transform: scale(0.95) translateY(12px);
                    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .retake-v3-backdrop.active .retake-v3-modal {
                    transform: scale(1) translateY(0);
                }
                .retake-v3-hd {
                    padding: 18px 22px;
                    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .retake-v3-title {
                    font-size: 16px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #F8FAFC;
                }
                .retake-v3-body {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    text-align: center;
                }
                .retake-v3-exam-card {
                    background: rgba(30, 41, 59, 0.7);
                    border: 1px solid rgba(212, 151, 59, 0.3);
                    border-radius: 18px;
                    padding: 16px;
                    text-align: right;
                }
                .retake-v3-student-strip {
                    background: rgba(15, 23, 42, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12.5px;
                    font-weight: 800;
                    color: #E2E8F0;
                }
                .retake-v3-auto-btn {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: #FFFFFF;
                    border: none;
                    border-radius: 16px;
                    padding: 15px 20px;
                    font-size: 15px;
                    font-weight: 900;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.45);
                    transition: all 0.22s ease;
                    width: 100%;
                }
                .retake-v3-auto-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.6);
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                }
                .retake-v3-chat-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    color: #CBD5E1;
                    border-radius: 14px;
                    padding: 12px 18px;
                    font-size: 13.5px;
                    font-weight: 800;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                .retake-v3-chat-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #FFFFFF;
                }
            `;
            document.head.appendChild(style);
        },

        // 9. Main Entry: Show Retake Authorization Modal (NO CODE BOX - INSTANT AUTOMATED ACTIVATION)
        showRetakeAuthorizationModal: function (exam, onUnlockedCallback) {
            this.injectStyles();
            const student = this.getStudent();
            const examId = this.normalizeExamId(exam);
            const examTitle = (exam.title || exam.examTitle || 'الاختبار الأكاديمي').replace(/^(📝\s*|امتحان\s*:\s*|امتحان\s+)+/gi, '').trim();
            const subjectName = exam.subject || exam.subjectName || 'طريقة العمل مع الأفراد';

            // Store current target exam for automated support preselection
            this.pendingRetakeExam = { id: examId, subject: subjectName, title: examTitle, callback: onUnlockedCallback };

            const existing = document.getElementById('retakeAuthModalBackdrop');
            if (existing) existing.remove();

            const backdrop = document.createElement('div');
            backdrop.id = 'retakeAuthModalBackdrop';
            backdrop.className = 'retake-v3-backdrop active';

            backdrop.innerHTML = `
                <div class="retake-v3-modal">
                    <div class="retake-v3-hd">
                        <div class="retake-v3-title">
                            <i class="fa-solid fa-graduation-cap" style="color: #F0B855;"></i>
                            <span>إعادة أداء الاختبار الأكاديمي 🔄</span>
                        </div>
                        <button onclick="ExamRetakeGuard.closeAuthModal()" style="background:transparent; border:none; color:#8DA0BF; font-size:18px; cursor:pointer;" title="إغلاق">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="retake-v3-body">
                        <!-- Exam Info & Status -->
                        <div class="retake-v3-exam-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size: 11.5px; font-weight: 800; color: #D4973B; background: rgba(212,151,59,0.15); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(212,151,59,0.3);">
                                    ${subjectName}
                                </span>
                                <span style="font-size: 11px; font-weight: 800; color: #F59E0B; background: rgba(245,158,11,0.15); padding: 3px 10px; border-radius: 12px;">
                                    أديت هذا الاختبار سابقاً ⚠️
                                </span>
                            </div>

                            <h3 style="font-size: 16.5px; font-weight: 900; color: #F8FAFC; margin: 4px 0 10px; line-height: 1.4;">
                                ${examTitle}
                            </h3>

                            <div style="font-size: 13px; color: #CBD5E1; line-height: 1.7; margin: 0; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                                مرحباً بك يا <b style="color:#60A5FA;">${student.studentName}</b>.
                                <br><span style="color:#FBBF24; font-weight:800;">🔒 تنبيه نظام التقييم:</span> المنصة تسمح بحل الامتحان مرة واحدة فقط لضمان دقة ومصداقية التقييم الأكاديمي.
                                <br><span style="color:#38BDF8; font-weight:800;">💬 لإعادة المحاولة:</span> يرجى الضغط على زر <b>محادثة الدعم الفني والأكاديمي</b> أدناه؛ وسيتم إرسال كودك وتوثيق طلبك وفتح الامتحان لك مباشرة عبر الدعم بدون أي خطوات معقدة.
                            </div>
                        </div>

                        <!-- Student Verified Info Strip -->
                        <div class="retake-v3-student-strip">
                            <div>
                                <i class="fa-solid fa-id-badge" style="color: #38BDF8; margin-left: 6px;"></i>
                                <span>كود الطالب: <b style="color: #FBBF24; font-family: monospace;">${student.studentCode}</b></span>
                            </div>
                            <div style="color: #10B981;">
                                <i class="fa-solid fa-shield-check"></i> موثق بالنظام
                            </div>
                        </div>

                        <!-- Primary Action: Open Academic Support Chat Directly -->
                        <div>
                            <button type="button" class="retake-v3-auto-btn" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);" onclick="ExamRetakeGuard.closeAuthModal(); ExamRetakeGuard.openAcademicSupportBot()">
                                <i class="fa-solid fa-headset" style="font-size: 18px; color: #93C5FD;"></i>
                                <span>محادثة الدعم الفني والأكاديمي لفتح الامتحان 💬</span>
                            </button>
                        </div>

                        <!-- Secondary Action: Cancel & Return -->
                        <div style="display: flex; justify-content: center; margin-top: 4px;">
                            <button type="button" class="retake-v3-chat-btn" onclick="ExamRetakeGuard.closeAuthModal()" style="width: 100%; justify-content: center;">
                                <span>إلغاء والعودة للمحاضرة</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(backdrop);
        },

        // 10. Interactive Academic Support Bot Dialog (Select Subject & Exam -> Auto Activate)
        openAcademicSupportBot: async function () {
            this.closeAuthModal(); // Close the first modal completely so there is NEVER a screen behind screen!
            this.injectStyles();
            const student = this.getStudent();
            const db = this.getDB();
            const pending = this.pendingRetakeExam || {};

            // Fetch real attempted exams for this student from Firebase!
            let realAttemptedExams = [];
            let allCurriculumExams = [];

            if (db) {
                try {
                    // Student's attempted exams
                    if (student.studentCode) {
                        const snap = await db.ref(`Students/${student.studentCode}/exams`).once('value');
                        if (snap.exists()) {
                            snap.forEach(c => {
                                const val = c.val() || {};
                                realAttemptedExams.push({
                                    id: c.key,
                                    title: (val.examTitle || val.title || 'امتحان سابق').replace(/^(📝\s*|امتحان\s*:\s*|امتحان\s+)+/gi, '').trim(),
                                    subject: val.subjectName || val.subject || 'مقرر دراسي'
                                });
                            });
                        }
                    }

                    // All system exams
                    const allSnap = await db.ref('Exams').once('value');
                    if (allSnap.exists()) {
                        allSnap.forEach(c => {
                            const val = c.val() || {};
                            allCurriculumExams.push({
                                id: c.key,
                                title: (val.title || 'امتحان أكاديمي').replace(/^(📝\s*|امتحان\s*:\s*|امتحان\s+)+/gi, '').trim(),
                                subject: val.subject || val.subjectName || 'مقرر دراسي'
                            });
                        });
                    }
                } catch (e) { }
            }

            // Build Subjects Options
            const subjectOptions = REAL_SUBJECTS.map(s => `<option value="${s}" ${pending.subject === s ? 'selected' : ''}>${s}</option>`).join('');

            // Build Exams Options
            let examOptions = '';
            if (pending.id && pending.title) {
                examOptions += `<optgroup label="📌 الاختبار المطلوب إعادة فتحه حالياً:">`;
                examOptions += `<option value="${pending.id}" data-subject="${pending.subject || ''}" data-title="${pending.title}" selected>${pending.title} (${pending.subject || 'مقرر دراسي'})</option>`;
                examOptions += `</optgroup>`;
            }

            if (realAttemptedExams.length > 0) {
                examOptions += `<optgroup label="🎯 امتحاناتك التي تم حلها سابقاً:">`;
                realAttemptedExams.forEach(e => {
                    examOptions += `<option value="${e.id}" data-subject="${e.subject}" data-title="${e.title}">${e.title} (${e.subject})</option>`;
                });
                examOptions += `</optgroup>`;
            }

            if (allCurriculumExams.length > 0) {
                examOptions += `<optgroup label="📚 بنك الامتحانات المتاح:">`;
                allCurriculumExams.forEach(e => {
                    examOptions += `<option value="${e.id}" data-subject="${e.subject}" data-title="${e.title}">${e.title} (${e.subject})</option>`;
                });
                examOptions += `</optgroup>`;
            } else {
                REAL_SUBJECTS.forEach((s, idx) => {
                    examOptions += `<option value="exam_subj_${idx}" data-subject="${s}" data-title="امتحان ${s}">امتحان: ${s}</option>`;
                });
            }

            Swal.fire({
                title: '<span style="font-size: 18px; font-weight: 900; color: #1E293B; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fa-solid fa-headset" style="color:#2563EB;"></i> الدعم الفني والأكاديمي | إعادة فتح الاختبار 🤖</span>',
                html: `
                    <div style="font-family:'Cairo',sans-serif; text-align:right; direction:rtl; padding:4px 2px;">
                        <!-- Student Code Badge -->
                        <div style="background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <span style="font-size: 11.5px; color: #64748B; font-weight: 700; display: block;">الطالب المسجل:</span>
                                <b style="font-size: 13.5px; color: #1E293B;">${student.studentName}</b>
                            </div>
                            <div style="text-align: left;">
                                <span style="font-size: 11.5px; color: #64748B; font-weight: 700; display: block;">كود الطالب:</span>
                                <span style="font-size: 14px; font-weight: 900; color: #2563EB; font-family: monospace;">${student.studentCode}</span>
                            </div>
                        </div>

                        <!-- Selector 1: Choose Subject -->
                        <div style="margin-bottom: 12px;">
                            <label style="display:block; font-size: 12.5px; font-weight: 800; color: #1E293B; margin-bottom: 5px;">
                                📚 1. اختر المقرر الدراسي (المادة):
                            </label>
                            <select id="botSubjectSelect" style="width: 100%; padding: 10px 14px; border: 1.5px solid #CBD5E1; border-radius: 12px; font-size: 13px; font-weight: 700; font-family:'Cairo',sans-serif; color: #1E293B; background: #F8FAFC; outline: none;">
                                <option value="">-- كل المقررات الدراسية --</option>
                                ${subjectOptions}
                            </select>
                        </div>

                        <!-- Selector 2: Choose Exam -->
                        <div style="margin-bottom: 16px;">
                            <label style="display:block; font-size: 12.5px; font-weight: 800; color: #1E293B; margin-bottom: 5px;">
                                📝 2. اختر الامتحان المطلوب إعادة حله:
                            </label>
                            <select id="botExamSelect" style="width: 100%; padding: 10px 14px; border: 1.5px solid #CBD5E1; border-radius: 12px; font-size: 13px; font-weight: 700; font-family:'Cairo',sans-serif; color: #1E293B; background: #F8FAFC; outline: none;">
                                ${examOptions}
                            </select>
                        </div>

                        <!-- Action Button: Grant Automatically -->
                        <button type="button" id="btnTriggerAutoGrant" style="width: 100%; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; border: none; border-radius: 14px; padding: 14px; font-size: 14.5px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4); transition: all 0.2s ease;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <span>إعادة فتح الاختبار لحسابي فورياً ⚡</span>
                        </button>

                        <!-- Success Box -->
                        <div id="botSuccessCard" style="display: none; margin-top: 16px; background: #ECFDF5; border: 2px solid #86EFAC; border-radius: 16px; padding: 16px; text-align: center;">
                            <div style="font-size: 14px; font-weight: 900; color: #065F46; margin-bottom: 6px;">
                                ✅ تم فتح الاختبار لحسابك بنجاح!
                            </div>
                            <div style="font-size: 12px; color: #047857; margin-bottom: 12px; line-height: 1.5;">
                                تم إرسال رسالة توثيق بكودك (<b style="font-family: monospace;">${student.studentCode}</b>) واعتماد إعادة المحاولة في سجل الدعم.
                            </div>
                            <button type="button" id="botBtnLaunchFullscreen" style="width: 100%; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; border: none; border-radius: 14px; padding: 12px; font-size: 14px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                                <i class="fa-solid fa-file-pen"></i>
                                <span>الانتقال لحل الاختبار الآن 🚀</span>
                            </button>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                customClass: { popup: 'swal2-royal-modal' },
                didOpen: () => {
                    const btnTrigger = document.getElementById('btnTriggerAutoGrant');
                    const successCard = document.getElementById('botSuccessCard');
                    const launchBtn = document.getElementById('botBtnLaunchFullscreen');
                    const subjSel = document.getElementById('botSubjectSelect');
                    const examSel = document.getElementById('botExamSelect');

                    let activeExamId = '';

                    // Pre-select pending exam if passed
                    if (pending.id) {
                        activeExamId = pending.id;
                        examSel.value = pending.id;
                    }

                    // Filter exams when subject changes
                    subjSel.addEventListener('change', () => {
                        const chosenSubj = subjSel.value.trim();
                        Array.from(examSel.options).forEach(opt => {
                            const optSubj = opt.getAttribute('data-subject') || '';
                            if (!chosenSubj || optSubj.includes(chosenSubj) || chosenSubj.includes(optSubj)) {
                                opt.style.display = '';
                            } else {
                                opt.style.display = 'none';
                            }
                        });
                        // Auto-select first visible if none selected
                        const currentOpt = examSel.options[examSel.selectedIndex];
                        if (!currentOpt || currentOpt.style.display === 'none') {
                            const firstVis = Array.from(examSel.options).find(o => o.style.display !== 'none');
                            if (firstVis) examSel.value = firstVis.value;
                        }
                    });

                    // Trigger Auto Grant
                    btnTrigger.addEventListener('click', async () => {
                        btnTrigger.disabled = true;
                        btnTrigger.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري التفعيل المؤتمت...</span>`;

                        const selectedOpt = examSel.options[examSel.selectedIndex] || {};
                        const chosenSubj = selectedOpt.getAttribute ? selectedOpt.getAttribute('data-subject') : subjSel.value || (pending.subject || 'طريقة العمل مع الأفراد');
                        const chosenTitle = selectedOpt.getAttribute ? selectedOpt.getAttribute('data-title') : (pending.title || 'امتحان تقييمي');
                        activeExamId = selectedOpt.value || pending.id || ('exam_' + Date.now().toString(36));

                        await ExamRetakeGuard.grantAutomatedRetakePermission(student.studentCode, activeExamId, chosenSubj, chosenTitle);

                        btnTrigger.style.display = 'none';
                        successCard.style.display = 'block';
                    });

                    // Launch Exam
                    launchBtn.addEventListener('click', () => {
                        Swal.close();
                        const selectedOpt = examSel.options[examSel.selectedIndex] || {};
                        const chosenSubj = selectedOpt.getAttribute ? selectedOpt.getAttribute('data-subject') : subjSel.value || (pending.subject || '');
                        const chosenTitle = selectedOpt.getAttribute ? selectedOpt.getAttribute('data-title') : (pending.title || '');
                        setTimeout(() => {
                            window.location.href = `quiz.html?examId=${encodeURIComponent(activeExamId)}&subject=${encodeURIComponent(chosenSubj)}&title=${encodeURIComponent(chosenTitle)}`;
                        }, 150);
                    });
                }
            });
        },

        closeAuthModal: function () {
            const m = document.getElementById('retakeAuthModalBackdrop');
            if (m) m.remove();
        }
    };

    window.ExamRetakeGuard = ExamRetakeGuard;

})(window);
