
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }

        const urlParams = new URLSearchParams(window.location.search);
        let rawSub = urlParams.get('subject') || "المادة الدراسية";
        try { rawSub = decodeURIComponent(rawSub); } catch(e) {}
        const subject = rawSub;

        document.getElementById('subjectTitle').innerText = subject;

        const user = JSON.parse(localStorage.getItem('user') || 'null');
        let currentLectureTitle = "";
        let notesTimeout = null;

        let allLessons = [];
        let currentCategory = 'all';

        // Fast Instant Cache Render (0ms lag)
        const cacheKey = 'elkheta_lec_' + encodeURIComponent(subject);
        const cachedLec = sessionStorage.getItem(cacheKey);
        if (cachedLec) {
            try {
                allLessons = JSON.parse(cachedLec);
                if (allLessons.length > 0) renderLessons(allLessons);
            } catch(e){}
        }

        function loadLessons() {
            // Fetch ONLY the specific subject node to minimize bandwidth and eliminate lag
            database.ref('Lectures').child(subject).once('value').then(snap => {
                let subjectLessons = [];
                if (snap.exists()) {
                    snap.forEach(c => {
                        subjectLessons.push({ id: c.key, ...c.val() });
                    });
                }

                allLessons = subjectLessons;
                sessionStorage.setItem(cacheKey, JSON.stringify(allLessons));
                renderLessons(allLessons);

                // Check standalone exams in background
                database.ref('Exams').child(subject).once('value').then(examSnap => {
                    if (examSnap.exists()) {
                        const val = examSnap.val();
                        if (typeof val === 'object' && !val.jsonCode && !val.title) {
                            Object.keys(val).forEach(examId => {
                                const ex = val[examId];
                                if (ex && !allLessons.some(l => l.id === examId || (ex.title && l.title === ex.title))) {
                                    allLessons.push({
                                        title: ex.title || ex.name || ex.examName || "امتحان",
                                        isStandaloneExam: true,
                                        jsonCode: ex.jsonCode,
                                        id: ex.id || examId
                                    });
                                }
                            });
                        } else if (val) {
                            if (!allLessons.some(l => l.id === subject || (val.title && l.title === val.title))) {
                                allLessons.push({
                                    title: val.title || val.name || val.examName || "امتحان",
                                    isStandaloneExam: true,
                                    jsonCode: val.jsonCode,
                                    id: val.id || subject
                                });
                            }
                        }
                        sessionStorage.setItem(cacheKey, JSON.stringify(allLessons));
                        renderLessons(allLessons);
                    }
                }).catch(() => {});
            }).catch(err => {
                console.error("Lectures error:", err);
                if (allLessons.length === 0) renderLessons([]);
            });
        }

        function switchCategory(cat, btnEl) {
            currentCategory = cat;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btnEl.classList.add('active');
            filterLessons();
        }

        function renderLessons(lessonsArray) {
            const list = document.getElementById('lessonsList');
            list.innerHTML = "";

            if (lessonsArray.length === 0) {
                list.innerHTML = `
                    <div class="card" style="text-align:center; padding:40px 20px;">
                        <div style="font-size:45px; margin-bottom:10px;">📂</div>
                        <h3 style="margin:0; color:var(--text-main);">لا توجد محاضرات مضافة حالياً</h3>
                        <p style="font-size:13px; color:var(--text-sub); margin-top:8px;">لم يقم المعلم أو الإدارة برفع دروس أو ملخصات لهذه المادة بعد.</p>
                        <button class="btn-primary" style="margin-top:15px; width:auto; padding:10px 25px;" onclick="location.href='courses.html'">العودة للمواد 📚</button>
                    </div>
                `;
                return;
            }

            const groups = {};
            lessonsArray.forEach((lesson, index) => {
                const chap = lesson.chapter || "محاضرات عامة";
                if (!groups[chap]) groups[chap] = [];
                groups[chap].push({ lesson, index });
            });

            for (const chap in groups) {
                let hasItemsForCurrentView = false;
                const groupItemsHTML = [];

                groups[chap].forEach(item => {
                    const { lesson, index } = item;
                    const escTitle = (lesson.title || "").replace(/'/g, "\\'");
                    const escVideoUrl = (lesson.videoUrl || "").replace(/'/g, "\\'");
                    const escPdfUrl = (lesson.pdfUrl || "").replace(/'/g, "\\'");

                    let isLocked = false;
                    let lockHTML = '';
                    if (lesson.unlockTime && Date.now() < lesson.unlockTime) {
                        isLocked = true;
                        const diff = lesson.unlockTime - Date.now();
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const mins = Math.floor((diff / 1000 / 60) % 60);
                        const timeStr = days > 0 ? `${days} أيام و ${hours} ساعة` : `${hours} ساعة و ${mins} دقيقة`;
                        
                        lockHTML = `
                            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 6px 12px; border-radius: 8px; margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #B45309; font-weight: bold;">
                                <span style="font-size: 14px;">⏳</span> مجدولة وتفتح بعد: <span dir="ltr" style="background: #ffffff; padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); color: #D97706;">${timeStr}</span>
                            </div>
                        `;
                    }

                    let badgesHTML = '';
                    if (lesson.videoUrl) badgesHTML += `<span style="background:#EEF2FF; color:#4F46E5; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-right:4px;">📺 فيديو</span>`;
                    if (lesson.pdfUrl) badgesHTML += `<span style="background:#FEF2F2; color:#DC2626; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-right:4px;">📄 ملخص</span>`;
                    if (lesson.jsonCode || lesson.examUrl || lesson.isStandaloneExam || lesson.hasQuiz !== false) badgesHTML += `<span style="background:#E8F8F5; color:#00B894; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-right:4px;">📝 امتحان</span>`;
                    
                    let descHTML = lesson.description ? `<div style="font-size:12px; color:#6B7280; margin-top:6px; line-height:1.5;">${lesson.description}</div>` : '';

                    if (lesson.isStandaloneExam) {
                        if (currentCategory === 'all' || currentCategory === 'quizzes') {
                            hasItemsForCurrentView = true;
                            groupItemsHTML.push(`
                                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin:0 0 12px 0;">
                                    <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="startExam('${escTitle}', '${lesson.id}')">
                                        <div style="width:48px; height:48px; background:#E8F8F5; color:#00B894; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:24px;">📝</div>
                                        <div>
                                            <strong style="font-size:15px; display:block;">${lesson.title}</strong>
                                            <div style="margin-top: 4px;">${badgesHTML}</div>
                                            ${descHTML}
                                        </div>
                                    </div>
                                    <div style="display:flex; gap:6px;">
                                        <button class="action-btn btn-quiz" style="background:#f1f5f9; color:#475569; padding:6px 12px; font-size:11px;" onclick="downloadOfflineExam('${escTitle}', '${lesson.id}')" title="تحميل الامتحان بصيغة HTML أوفلاين">📥 تحميل</button>
                                        <button class="action-btn btn-quiz" style="padding:6px 12px; font-size:11px;" onclick="startExam('${escTitle}', '${lesson.id}')">بدء 🚀</button>
                                    </div>
                                </div>
                            `);
                        }
                        return;
                    }

                    if (currentCategory === 'all') {
                        hasItemsForCurrentView = true;
                        groupItemsHTML.push(`
                            <div class="lesson-package">
                                <div class="lesson-header-row">
                                    <div class="lesson-title-area">
                                        <div class="lesson-number">${index+1}</div>
                                        <div class="lesson-info">
                                            <h4>${lesson.title}</h4>
                                            <div style="margin-top: 4px;"><span>⏱️ ${lesson.duration || 'متوفر'}</span> ${badgesHTML}</div>
                                            ${descHTML}
                                            ${lockHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="lesson-actions">
                                    ${escVideoUrl 
                                        ? `<button class="action-btn btn-video" onclick="openVideoPlayer('${escVideoUrl}', '${escTitle}')"><i>📺</i> فيديو</button>` 
                                        : `<button class="action-btn btn-disabled" onclick="showToast('فيديو المحاضرة غير متوفر حالياً', 'warning')"><i style="filter: grayscale(1);">📺</i> غير متوفر</button>`}
                                    ${escPdfUrl 
                                        ? `<button class="action-btn btn-pdf" onclick="openPdf('${escPdfUrl}')"><i>📄</i> ملخص</button>` 
                                        : `<button class="action-btn btn-disabled" onclick="showToast('الملخص غير متوفر حالياً', 'warning')"><i style="filter: grayscale(1);">📄</i> غير متوفر</button>`}
                                    ${lesson.jsonCode || lesson.examUrl || lesson.isStandaloneExam || lesson.hasQuiz !== false 
                                        ? `<button class="action-btn btn-quiz" onclick="startExam('${escTitle}', '${lesson.id || ''}')"><i>📝</i> امتحان</button><button class="action-btn btn-quiz" style="background:#f1f5f9; color:#475569; margin-right:6px;" onclick="downloadOfflineExam('${escTitle}', '${lesson.id || ''}')" title="تحميل الامتحان بصيغة HTML أوفلاين"><i>📥</i> تحميل</button>` 
                                        : `<button class="action-btn btn-disabled" onclick="showToast('الامتحان غير متوفر حالياً', 'warning')"><i style="filter: grayscale(1);">📝</i> غير متوفر</button>`}
                                </div>
                            </div>
                        `);
                    } else if (currentCategory === 'videos' && lesson.videoUrl) {
                        hasItemsForCurrentView = true;
                        groupItemsHTML.push(`
                            <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;" onclick="openVideoPlayer('${escVideoUrl}', '${escTitle}')">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width:40px; height:40px; background:#EEF2FF; color:#4F46E5; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📺</div>
                                    <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">فيديو المحاضرة</span></div>
                                </div>
                                <span style="background:rgba(79,70,229,0.1); color:#4F46E5; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">تشغيل</span>
                            </div>
                        `);
                    } else if (currentCategory === 'pdfs' && lesson.pdfUrl) {
                        hasItemsForCurrentView = true;
                        groupItemsHTML.push(`
                            <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;" onclick="openPdf('${escPdfUrl}')">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width:40px; height:40px; background:#FEF2F2; color:#DC2626; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📄</div>
                                    <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">ملخص المحاضرة</span></div>
                                </div>
                                <span style="background:rgba(220,38,38,0.1); color:#DC2626; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">فتح</span>
                            </div>
                        `);
                    } else if (currentCategory === 'quizzes' && (lesson.jsonCode || lesson.examUrl || lesson.hasQuiz !== false)) {
                        hasItemsForCurrentView = true;
                        groupItemsHTML.push(`
                            <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="startExam('${escTitle}', '${lesson.id || ''}')">
                                    <div style="width:40px; height:40px; background:#E8F8F5; color:#00B894; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📝</div>
                                    <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">امتحان المحاضرة</span></div>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <button class="action-btn btn-quiz" style="background:#f1f5f9; color:#475569; padding:6px 12px; font-size:11px;" onclick="downloadOfflineExam('${escTitle}', '${lesson.id || ''}')" title="تحميل أوفلاين">📥 تحميل</button>
                                    <button class="action-btn btn-quiz" style="padding:6px 12px; font-size:11px;" onclick="startExam('${escTitle}', '${lesson.id || ''}')">بدء 🚀</button>
                                </div>
                            </div>
                        `);
                    }
                });

                if (hasItemsForCurrentView) {
                    const groupContainer = document.createElement('div');
                    groupContainer.style.marginBottom = '25px';
                    const showHeader = chap !== "محاضرات عامة" || Object.keys(groups).length > 1;
                    if (showHeader) {
                        groupContainer.innerHTML = `
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px; padding-right:5px;">
                                <div style="width:8px; height:24px; background:var(--primary); border-radius:4px;"></div>
                                <h3 style="margin:0; color:var(--text-main); font-size:18px; font-weight:800;">${chap}</h3>
                            </div>
                        `;
                    }
                    groupContainer.innerHTML += groupItemsHTML.join('');
                    list.appendChild(groupContainer);
                }
            }
        }

        function openPdf(url) {
            if (!url || url === 'undefined' || url === 'null') {
                showToast("لم يتم إرفاق ملف ملخص لهذه المحاضرة بعد 📄", "warning");
            } else {
                window.open(url, '_blank');
            }
        }

        function filterLessons() {
            const query = (document.getElementById('lessonSearchInput') ? document.getElementById('lessonSearchInput').value : "").trim().toLowerCase();
            let filtered = allLessons;
            if (query) {
                filtered = filtered.filter(l => l.title && l.title.toLowerCase().includes(query));
            }
            renderLessons(filtered);
        }

        // Video Player Handlers
        const player = document.getElementById('customVideoPlayer');
        if (player) {
            player.addEventListener('timeupdate', () => {
                if (player.currentTime > 0 && currentLectureTitle) {
                    const key = `video_progress_${user ? user.studentCode : 'guest'}_${currentLectureTitle}`;
                    localStorage.setItem(key, player.currentTime);
                }
            });
        }

        function openVideoPlayer(videoUrl, title) {
            currentLectureTitle = title;
            document.getElementById('modalVideoTitle').innerText = title;

            const directPlayer = document.getElementById('customVideoPlayer');
            const driveFrame = document.getElementById('driveIframe');
            const mobileFallback = document.getElementById('driveMobileFallback');
            const btnOpenDrive = document.getElementById('btnOpenDrive');
            const speedControls = document.getElementById('speedControls');
            const vc = document.getElementById('videoContainer');

            let driveFileId = null;
            if (videoUrl) {
                const driveMatch = videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (driveMatch) driveFileId = driveMatch[1];
            }

            if (driveFileId) {
                directPlayer.style.display = 'none';
                directPlayer.src = '';
                speedControls.style.display = 'none';
                vc.style.paddingBottom = '0';
                
                if (window.innerWidth <= 768) {
                    driveFrame.style.display = 'block';
                    driveFrame.src = `https://drive.google.com/file/d/${driveFileId}/preview`;
                    mobileFallback.style.display = 'flex';
                    vc.style.height = '35vh';
                    vc.style.minHeight = '250px';
                    
                    btnOpenDrive.onclick = () => {
                        mobileFallback.style.display = 'none';
                        const elem = document.getElementById('videoContainer');
                        if (elem.requestFullscreen) elem.requestFullscreen();
                        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
                    };
                } else {
                    mobileFallback.style.display = 'none';
                    driveFrame.style.display = 'block';
                    driveFrame.src = `https://drive.google.com/file/d/${driveFileId}/preview`;
                    vc.style.height = '50vh';
                    vc.style.minHeight = '400px'; 
                }
            } else if (videoUrl && videoUrl !== 'undefined' && videoUrl !== 'null') {
                driveFrame.style.display = 'none';
                driveFrame.src = '';
                mobileFallback.style.display = 'none';
                directPlayer.style.display = 'block';
                speedControls.style.display = 'flex';
                
                vc.style.height = '0';
                vc.style.minHeight = '0';
                vc.style.paddingBottom = '56.25%';
                
                directPlayer.src = videoUrl;

                const savedTime = localStorage.getItem(`video_progress_${user ? user.studentCode : 'guest'}_${title}`);
                if (savedTime) {
                    directPlayer.addEventListener('loadedmetadata', () => {
                        directPlayer.currentTime = parseFloat(savedTime);
                    }, { once: true });
                }

                directPlayer.playbackRate = 1.0;
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.speed-btn[onclick*="1,"]')?.classList.add('active');
                directPlayer.play().catch(() => {});
            } else {
                showToast('لم يتم رفع فيديو لهذه المحاضرة بعد 📺', 'warning');
                return;
            }

            if (subject && title) {
                localStorage.setItem('last_accessed_subject', subject);
                localStorage.setItem('last_accessed_lecture', title);
            }

            document.getElementById('lessonNotes').value = "جاري تحميل ملاحظاتك...";
            if (user && user.studentCode) {
                database.ref(`Students/${user.studentCode}/Notes/${title}`).once('value').then(snap => {
                    document.getElementById('lessonNotes').value = snap.val() || "";
                });
            } else {
                document.getElementById('lessonNotes').value = "";
            }

            document.getElementById('playerModal').classList.add('active');
        }

        function closeVideoPlayer() {
            const directPlayer = document.getElementById('customVideoPlayer');
            const driveFrame = document.getElementById('driveIframe');
            directPlayer.pause();
            directPlayer.src = '';
            driveFrame.src = '';
            document.getElementById('playerModal').classList.remove('active');
        }

        function setPlaySpeed(rate, buttonEl) {
            player.playbackRate = rate;
            document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            buttonEl.classList.add('active');
        }

        function saveNotes() {
            if (!user || !user.studentCode || !currentLectureTitle) return;
            const notesText = document.getElementById('lessonNotes').value;
            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(() => {
                database.ref(`Students/${user.studentCode}/Notes/${currentLectureTitle}`).set(notesText);
            }, 800);
        }

        function startExam(lessonTitle, lessonIdOrCode) {
            const found = allLessons.find(l => l.id === lessonIdOrCode || l.title === lessonTitle);
            const jsonCode = (found && found.jsonCode) ? found.jsonCode : lessonIdOrCode;

            if (jsonCode && jsonCode.trim().startsWith('[') || jsonCode && jsonCode.trim().startsWith('{')) {
                sessionStorage.setItem('currentExamData', jsonCode);
                window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}&fromStorage=true`;
                return;
            }

            database.ref('Exams').once('value').then(snap => {
                let foundExam = null;
                if (snap.exists()) {
                    snap.forEach(child => {
                        if (foundExam) return;
                        const val = child.val();
                        if (val && typeof val === 'object' && !val.jsonCode && !val.title) {
                            Object.values(val).forEach(ex => {
                                if (foundExam) return;
                                if (ex && (ex.title === lessonTitle || ex.name === lessonTitle) && ex.jsonCode) foundExam = ex;
                            });
                        } else if (val && (val.title === lessonTitle || val.name === lessonTitle) && val.jsonCode) {
                            foundExam = val;
                        }
                    });
                }

                if (foundExam && foundExam.jsonCode) {
                    sessionStorage.setItem('currentExamData', foundExam.jsonCode);
                    window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}&fromStorage=true`;
                } else {
                    window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
                }
            }).catch(() => {
                window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
            });
        }

                                // Offline HTML Exam Downloader (Robust Engine: MCQ, Matching, True/False, Essay & Full Model Report)
        function downloadOfflineExam(lessonTitle, lessonIdOrCode) {
            try {
                showToast("جاري تجهيز الامتحان للتحميل بصيغة HTML أوفلاين...", "info");
                let questions = null;
                const found = allLessons.find(l => l.id === lessonIdOrCode || l.title === lessonTitle);
                let rawCode = (found && found.jsonCode) ? found.jsonCode : lessonIdOrCode;

                if (rawCode) {
                    try {
                        questions = JSON.parse(rawCode);
                    } catch(e) {
                        try { questions = JSON.parse(decodeURIComponent(rawCode)); } catch(e2) {}
                    }
                }

                if (!questions || (Array.isArray(questions) && questions.length === 0) || (typeof questions === 'object' && Object.keys(questions).length === 0)) {
                    database.ref('Exams').once('value').then(snap => {
                        let foundCode = null;
                        if (snap.exists()) {
                            snap.forEach(child => {
                                if (foundCode) return;
                                const val = child.val();
                                if (val && typeof val === 'object' && !val.jsonCode && !val.title) {
                                    Object.values(val).forEach(ex => {
                                        if (foundCode) return;
                                        if (ex && (ex.title === lessonTitle || ex.name === lessonTitle) && ex.jsonCode) {
                                            foundCode = ex.jsonCode;
                                        }
                                    });
                                } else if (val && (val.title === lessonTitle || val.name === lessonTitle) && val.jsonCode) {
                                    foundCode = val.jsonCode;
                                }
                            });
                        }

                        if (foundCode) {
                            downloadOfflineExam(lessonTitle, foundCode);
                        } else {
                            showToast("⚠️ لا توجد أسئلة جاهزة للتحميل في هذا الامتحان", "warning");
                        }
                    });
                    return;
                }

                const safeTitle = (lessonTitle || subject || 'امتحان').replace(/[\\/:*?"<>|]/g, '').trim();
                const questionsJSON = JSON.stringify(questions);

                const htmlParts = [
                    '<!DOCTYPE html>',
                    '<html lang="ar" dir="rtl">',
                    '<head>',
                    '    <meta charset="UTF-8">',
                    '    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
                    '    <title>' + safeTitle + ' - امتحان أوفلاين | ELKHETA</title>',
                    '    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">',
                    '    <style>',
                    '        * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Cairo", sans-serif; -webkit-tap-highlight-color: transparent; }',
                    '        :root {',
                    '            --primary: #4F46E5; --primary-dark: #3730A3; --bg: #F8FAFC; --surface: #FFFFFF;',
                    '            --text-main: #1E293B; --text-sub: #64748B; --border: #E2E8F0;',
                    '            --success: #10B981; --success-bg: #DCFCE7; --danger: #EF4444; --danger-bg: #FEE2E2;',
                    '            --warning: #F59E0B; --warning-bg: #FEF3C7;',
                    '        }',
                    '        body { background: var(--bg); color: var(--text-main); min-height: 100vh; padding-bottom: 90px; }',
                    '        .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 20px 16px; position: sticky; top: 0; z-index: 100; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2); }',
                    '        .header-inner { max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 15px; }',
                    '        .header-title h1 { font-size: 18px; font-weight: 900; }',
                    '        .header-title p { font-size: 12px; opacity: 0.85; margin-top: 2px; }',
                    '        .timer-badge { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 6px; }',
                    '        .container { max-width: 800px; margin: 20px auto 0; padding: 0 16px; }',
                    '        .progress-box { background: white; border-radius: 18px; padding: 14px 18px; border: 1px solid var(--border); margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }',
                    '        .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; font-weight: 800; color: var(--text-sub); }',
                    '        .progress-bar-wrap { background: #E2E8F0; height: 8px; border-radius: 4px; overflow: hidden; }',
                    '        .progress-bar-fill { background: var(--primary); height: 100%; width: 0%; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }',
                    '        .instant-toggle-row { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 13px; font-weight: 800; color: #475569; }',
                    '        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }',
                    '        .switch input { opacity: 0; width: 0; height: 0; }',
                    '        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #CBD5E1; transition: .3s; border-radius: 24px; }',
                    '        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }',
                    '        input:checked + .slider { background-color: #10B981; }',
                    '        input:checked + .slider:before { transform: translateX(20px); }',
                    '        .q-card { background: white; border-radius: 24px; padding: 25px 22px; margin-bottom: 25px; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }',
                    '        .q-badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }',
                    '        .q-num-badge { background: #EEF2FF; color: var(--primary); font-size: 13px; font-weight: 900; padding: 5px 14px; border-radius: 10px; }',
                    '        .q-type-badge { background: #F1F5F9; color: #64748B; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 8px; }',
                    '        .q-text { font-size: 19px; font-weight: 900; color: var(--text-main); line-height: 1.6; margin-bottom: 22px; }',
                    '        .options-grid { display: flex; flex-direction: column; gap: 12px; }',
                    '        .tf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }',
                    '        .option-btn { background: #F8FAFC; border: 2px solid var(--border); border-radius: 16px; padding: 16px 20px; font-size: 16px; font-weight: 800; color: var(--text-main); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; text-align: right; }',
                    '        .option-btn:hover:not(:disabled) { border-color: var(--primary); background: #EEF2FF; }',
                    '        .option-btn.selected { border-color: var(--primary); background: #EEF2FF; color: var(--primary); }',
                    '        .option-btn.correct-btn { border-color: var(--success) !important; background: var(--success-bg) !important; color: #166534 !important; }',
                    '        .option-btn.wrong-btn { border-color: var(--danger) !important; background: var(--danger-bg) !important; color: #991B1B !important; }',
                    '        .matching-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }',
                    '        @media (max-width: 600px) { .matching-container { grid-template-columns: 1fr; } }',
                    '        .matching-col { display: flex; flex-direction: column; gap: 10px; }',
                    '        .matching-item { background: #F8FAFC; border: 2px solid var(--border); border-radius: 14px; padding: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; min-height: 52px; }',
                    '        .matching-item:hover { border-color: var(--primary); }',
                    '        .matching-item.active-select { border-color: #6366F1; background: #EEF2FF; transform: scale(1.02); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15); }',
                    '        .matching-item.connected { border-style: solid; font-weight: 900; }',
                    '        .matching-badge { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; color: white; font-size: 12px; font-weight: 900; }',
                    '        .matching-reset-btn { width: 100%; background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 13px; margin-top: 10px; cursor: pointer; }',
                    '        .explanation-box { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 14px; padding: 16px; margin-top: 20px; font-size: 14px; color: #1E40AF; line-height: 1.6; display: none; }',
                    '        .essay-textarea { width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 14px; font-size: 15px; font-weight: 700; outline: none; transition: border-color 0.2s; resize: vertical; margin-bottom: 12px; }',
                    '        .essay-textarea:focus { border-color: var(--primary); }',
                    '        .bottom-nav-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid var(--border); padding: 14px 20px; z-index: 100; box-shadow: 0 -5px 25px rgba(0,0,0,0.05); }',
                    '        .nav-inner { max-width: 800px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 12px; }',
                    '        .btn-nav { padding: 12px 24px; border-radius: 14px; font-size: 15px; font-weight: 900; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }',
                    '        .btn-nav.prev { background: #F1F5F9; color: #475569; }',
                    '        .btn-nav.next { background: var(--primary); color: white; }',
                    '        .btn-nav.finish { background: linear-gradient(135deg, #10B981, #059669); color: white; box-shadow: 0 4px 15px rgba(16,185,129,0.3); }',
                    '        .btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }',
                    '        .filter-tab { padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 800; border: 1.5px solid var(--border); background: white; cursor: pointer; }',
                    '        .filter-tab.active { background: var(--primary); color: white; border-color: var(--primary); }',
                    '    </style>',
                    '</head>',
                    '<body>',
                    '    <div class="header">',
                    '        <div class="header-inner">',
                    '            <div class="header-title">',
                    '                <h1>' + safeTitle + '</h1>',
                    '                <p>منصة الخطة التعليمية — نسخة بدون إنترنت ⚡</p>',
                    '            </div>',
                    '            <div class="timer-badge" id="timerBadge">⏳ 00:00</div>',
                    '        </div>',
                    '    </div>',
                    '    <div class="container" id="mainContainer">',
                    '        <div class="progress-box">',
                    '            <div class="progress-header">',
                    '                <span id="qCounterText">سؤال 1</span>',
                    '                <span id="qPctText">0%</span>',
                    '            </div>',
                    '            <div class="progress-bar-wrap"><div class="progress-bar-fill" id="pFill"></div></div>',
                    '            <div class="instant-toggle-row">',
                    '                <span>⚡ التصحيح الفوري والتفسير بعد كل سؤال:</span>',
                    '                <label class="switch">',
                    '                    <input type="checkbox" id="instantToggle" checked onchange="toggleInstantCorrection()">',
                    '                    <span class="slider"></span>',
                    '                </label>',
                    '            </div>',
                    '        </div>',
                    '        <div class="q-card" id="questionCard">',
                    '            <div class="q-badge-row">',
                    '                <span class="q-num-badge" id="qBadge">سؤال 1</span>',
                    '                <span class="q-type-badge" id="qTypeBadge">اختيار من متعدد</span>',
                    '            </div>',
                    '            <div class="q-text" id="qText"></div>',
                    '            <div id="optionsArea"></div>',
                    '            <div class="explanation-box" id="explanationBox"></div>',
                    '        </div>',
                    '    </div>',
                    '    <div class="bottom-nav-bar" id="bottomNav">',
                    '        <div class="nav-inner">',
                    '            <button class="btn-nav prev" id="prevBtn" onclick="prevQuestion()" disabled>➡️ السابق</button>',
                    '            <button class="btn-nav next" id="nextBtn" onclick="nextQuestion()">التالي ⬅️</button>',
                    '            <button class="btn-nav finish" id="finishBtn" onclick="submitExam()" style="display:none;">إنهاء وتصحيح الامتحان 🚀</button>',
                    '        </div>',
                    '    </div>',
                    '    <' + 'script>',
                    '        var rawQuestions = ' + questionsJSON + ';',
                    '        var rawList = Array.isArray(rawQuestions) ? rawQuestions : (rawQuestions.questions ? (Array.isArray(rawQuestions.questions) ? rawQuestions.questions : Object.values(rawQuestions.questions)) : Object.values(rawQuestions));',
                    '        var questions = rawList.map(function(q, i) {',
                    '            var cIdx = q.correct;',
                    '            if (cIdx === undefined && q.correctAnswerIndex !== undefined) cIdx = q.correctAnswerIndex;',
                    '            if (cIdx === undefined && q.answer !== undefined && typeof q.answer === "number") cIdx = q.answer;',
                    '            if (cIdx === undefined && q.correctAnswer !== undefined && q.options) {',
                    '                var fOpt = q.options.indexOf(q.correctAnswer);',
                    '                if (fOpt !== -1) cIdx = fOpt;',
                    '            }',
                    '            var parsedPairs = null;',
                    '            if (q.pairs) {',
                    '                if (Array.isArray(q.pairs)) {',
                    '                    parsedPairs = q.pairs.map(function(p){ return { left: p.left || p.source || p.question || p.from || p.a || "", right: p.right || p.target || p.answer || p.to || p.b || "" }; });',
                    '                } else if (typeof q.pairs === "object") {',
                    '                    parsedPairs = Object.keys(q.pairs).map(function(k){ return { left: k, right: q.pairs[k] }; });',
                    '                }',
                    '            } else if (q.matching) {',
                    '                if (Array.isArray(q.matching)) {',
                    '                    parsedPairs = q.matching.map(function(p){ return { left: p.left || p.source || "", right: p.right || p.target || "" }; });',
                    '                }',
                    '            }',
                    '            var qType = q.type || (parsedPairs ? "matching" : ((q.options && q.options.length > 0) ? "mcq" : "essay"));',
                    '            return {',
                    '                text: q.text || q.question || q.title || "سؤال " + (i + 1),',
                    '                options: q.options || [],',
                    '                pairs: parsedPairs,',
                    '                type: qType,',
                    '                correct: (cIdx !== undefined && cIdx !== -1) ? parseInt(cIdx) : 0,',
                    '                explanation: q.explanation || q.modelAnswer || q.hint || ""',
                    '            };',
                    '        });',
                    '        var currentIndex = 0;',
                    '        var userAnswers = {};',
                    '        var isInstantFeedback = true;',
                    '        var timerSeconds = 0;',
                    '        var timerInterval = setInterval(function() {',
                    '            timerSeconds++;',
                    '            var m = Math.floor(timerSeconds / 60).toString().padStart(2, "0");',
                    '            var s = (timerSeconds % 60).toString().padStart(2, "0");',
                    '            document.getElementById("timerBadge").textContent = "⏳ " + m + ":" + s;',
                    '        }, 1000);',
                    '        var activeMatchingLeft = null;',
                    '        var activeMatchingRight = null;',
                    '        function toggleInstantCorrection() {',
                    '            isInstantFeedback = document.getElementById("instantToggle").checked;',
                    '            showQuestion();',
                    '        }',
                    '        function showQuestion() {',
                    '            if (questions.length === 0) return;',
                    '            var q = questions[currentIndex];',
                    '            document.getElementById("qBadge").textContent = "سؤال " + (currentIndex + 1);',
                    '            document.getElementById("qCounterText").textContent = "سؤال " + (currentIndex + 1) + " من " + questions.length;',
                    '            var pct = Math.round(((currentIndex + 1) / questions.length) * 100);',
                    '            document.getElementById("qPctText").textContent = pct + "%";',
                    '            document.getElementById("pFill").style.width = pct + "%";',
                    '            document.getElementById("qText").textContent = q.text;',
                    '            var typeName = "اختيار من متعدد";',
                    '            if (q.type === "essay") typeName = "سؤال مقالي";',
                    '            else if (q.type === "matching" || q.pairs) typeName = "سؤال توصيل ومطابقة";',
                    '            else if (q.options.length === 2 && (q.options.includes("صح") || q.options.includes("صواب") || q.options.includes("✅"))) typeName = "صواب أم خطأ";',
                    '            document.getElementById("qTypeBadge").textContent = typeName;',
                    '            var optArea = document.getElementById("optionsArea");',
                    '            var expBox = document.getElementById("explanationBox");',
                    '            optArea.innerHTML = "";',
                    '            expBox.style.display = "none";',
                    '            var isAns = userAnswers[currentIndex] && userAnswers[currentIndex].answered;',
                    '            if (q.type === "essay") {',
                    '                var val = (userAnswers[currentIndex] && userAnswers[currentIndex].text) ? userAnswers[currentIndex].text : "";',
                    '                optArea.innerHTML = "<textarea class=\'essay-textarea\' id=\'essayInput\' placeholder=\'اكتب إجابتك هنا بالتفصيل...\' rows=\'4\'>" + val + "</textarea>";',
                    '                document.getElementById("essayInput").oninput = function(e) {',
                    '                    userAnswers[currentIndex] = { answered: true, text: e.target.value, correct: true };',
                    '                };',
                    '                if (isAns && isInstantFeedback && q.explanation) {',
                    '                    expBox.style.display = "block";',
                    '                    expBox.innerHTML = "💡 <strong>الإجابة النموذجية والتفسير:</strong><br>" + q.explanation;',
                    '                }',
                    '            } else if (q.type === "matching" || q.pairs) {',
                    '                renderMatching(q, optArea, isAns);',
                    '                if (isAns && isInstantFeedback && q.explanation) {',
                    '                    expBox.style.display = "block";',
                    '                    expBox.innerHTML = "💡 <strong>التفسير والتوضيح:</strong><br>" + q.explanation;',
                    '                }',
                    '            } else {',
                    '                var isTF = q.options.length === 2 && (q.options.includes("صح") || q.options.includes("صواب") || q.options.includes("✅"));',
                    '                optArea.className = isTF ? "options-grid tf-grid" : "options-grid";',
                    '                q.options.forEach(function(opt, oIdx) {',
                    '                    var btn = document.createElement("button");',
                    '                    btn.className = "option-btn";',
                    '                    btn.textContent = opt;',
                    '                    if (isAns) {',
                    '                        btn.disabled = true;',
                    '                        var selIdx = userAnswers[currentIndex].selectedIdx;',
                    '                        if (oIdx === selIdx) {',
                    '                            btn.classList.add("selected");',
                    '                            if (isInstantFeedback) {',
                    '                                if (userAnswers[currentIndex].correct) {',
                    '                                    btn.classList.add("correct-btn");',
                    '                                    btn.innerHTML += " <span>✅</span>";',
                    '                                } else {',
                    '                                    btn.classList.add("wrong-btn");',
                    '                                    btn.innerHTML += " <span>❌</span>";',
                    '                                }',
                    '                            } else {',
                    '                                btn.innerHTML += " <span>🔵</span>";',
                    '                            }',
                    '                        } else if (isInstantFeedback && oIdx === q.correct) {',
                    '                            btn.classList.add("correct-btn");',
                    '                        }',
                    '                    } else {',
                    '                        btn.onclick = function() { selectMCQ(oIdx); };',
                    '                    }',
                    '                    optArea.appendChild(btn);',
                    '                });',
                    '                if (isAns && isInstantFeedback && q.explanation) {',
                    '                    expBox.style.display = "block";',
                    '                    expBox.innerHTML = "💡 <strong>الشرح والتوضيح:</strong><br>" + q.explanation;',
                    '                }',
                    '            }',
                    '            document.getElementById("prevBtn").disabled = currentIndex === 0;',
                    '            if (currentIndex === questions.length - 1) {',
                    '                document.getElementById("nextBtn").style.display = "none";',
                    '                document.getElementById("finishBtn").style.display = "flex";',
                    '            } else {',
                    '                document.getElementById("nextBtn").style.display = "flex";',
                    '                document.getElementById("finishBtn").style.display = "none";',
                    '            }',
                    '        }',
                    '        function selectMCQ(idx) {',
                    '            var q = questions[currentIndex];',
                    '            var isCorrect = idx === q.correct;',
                    '            userAnswers[currentIndex] = { answered: true, correct: isCorrect, selectedIdx: idx };',
                    '            showQuestion();',
                    '        }',
                    '        function renderMatching(q, container, isAns) {',
                    '            container.className = ""; container.innerHTML = "";',
                    '            var pairs = q.pairs || [];',
                    '            if (pairs.length === 0) { container.innerHTML = "<p style=\'color:#94A3B8;\'>لا توجد عناصر توصيل محددة</p>"; return; }',
                    '            if (!q._shuffledRights) {',
                    '                q._shuffledRights = pairs.map(function(p){ return p.right; }).sort(function(){ return 0.5 - Math.random(); });',
                    '            }',
                    '            var matches = (userAnswers[currentIndex] && userAnswers[currentIndex].matches) ? userAnswers[currentIndex].matches : {};',
                    '            var wrap = document.createElement("div"); wrap.className = "matching-container";',
                    '            var lCol = document.createElement("div"); lCol.className = "matching-col";',
                    '            var rCol = document.createElement("div"); rCol.className = "matching-col";',
                    '            var colors = ["#4F46E5", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#06B6D4"];',
                    '            pairs.forEach(function(p) {',
                    '                var item = document.createElement("div"); item.className = "matching-item";',
                    '                var isMatched = matches[p.left] !== undefined;',
                    '                var mIdx = isMatched ? Object.keys(matches).indexOf(p.left) : -1;',
                    '                var col = mIdx >= 0 ? colors[mIdx % colors.length] : null;',
                    '                if (isMatched) {',
                    '                    item.classList.add("connected");',
                    '                    if (isAns && isInstantFeedback) {',
                    '                        var isOk = matches[p.left] === p.right;',
                    '                        item.style.borderColor = isOk ? "#10B981" : "#EF4444";',
                    '                        item.style.background = isOk ? "#DCFCE7" : "#FEE2E2";',
                    '                    } else {',
                    '                        item.style.borderColor = col; item.style.background = col + "15";',
                    '                    }',
                    '                }',
                    '                if (activeMatchingLeft === p.left) item.classList.add("active-select");',
                    '                item.innerHTML = "<span>" + p.left + "</span>" + (isMatched ? "<span class=\'matching-badge\' style=\'background:" + ((isAns && isInstantFeedback) ? (matches[p.left] === p.right ? "#10B981" : "#EF4444") : col) + "\'>" + (mIdx + 1) + "</span>" : "");',
                    '                if (!isAns) {',
                    '                    item.onclick = function() {',
                    '                        if (activeMatchingRight) {',
                    '                            matches[p.left] = activeMatchingRight;',
                    '                            activeMatchingLeft = null; activeMatchingRight = null;',
                    '                            handleMatchUpdate(q, matches);',
                    '                        } else {',
                    '                            activeMatchingLeft = (activeMatchingLeft === p.left) ? null : p.left;',
                    '                            renderMatching(q, container, isAns);',
                    '                        }',
                    '                    };',
                    '                }',
                    '                lCol.appendChild(item);',
                    '            });',
                    '            q._shuffledRights.forEach(function(rVal) {',
                    '                var item = document.createElement("div"); item.className = "matching-item";',
                    '                var matchedLeft = Object.keys(matches).find(function(l){ return matches[l] === rVal; });',
                    '                var isMatched = matchedLeft !== undefined;',
                    '                var mIdx = isMatched ? Object.keys(matches).indexOf(matchedLeft) : -1;',
                    '                var col = mIdx >= 0 ? colors[mIdx % colors.length] : null;',
                    '                if (isMatched) {',
                    '                    item.classList.add("connected");',
                    '                    if (isAns && isInstantFeedback) {',
                    '                        var correctP = pairs.find(function(p){ return p.left === matchedLeft; });',
                    '                        var isOk = correctP && correctP.right === rVal;',
                    '                        item.style.borderColor = isOk ? "#10B981" : "#EF4444";',
                    '                        item.style.background = isOk ? "#DCFCE7" : "#FEE2E2";',
                    '                    } else {',
                    '                        item.style.borderColor = col; item.style.background = col + "15";',
                    '                    }',
                    '                }',
                    '                if (activeMatchingRight === rVal) item.classList.add("active-select");',
                    '                item.innerHTML = "<span>" + rVal + "</span>" + (isMatched ? "<span class=\'matching-badge\' style=\'background:" + col + "\'>" + (mIdx + 1) + "</span>" : "");',
                    '                if (!isAns) {',
                    '                    item.onclick = function() {',
                    '                        if (activeMatchingLeft) {',
                    '                            matches[activeMatchingLeft] = rVal;',
                    '                            activeMatchingLeft = null; activeMatchingRight = null;',
                    '                            handleMatchUpdate(q, matches);',
                    '                        } else {',
                    '                            activeMatchingRight = (activeMatchingRight === rVal) ? null : rVal;',
                    '                            renderMatching(q, container, isAns);',
                    '                        }',
                    '                    };',
                    '                }',
                    '                rCol.appendChild(item);',
                    '            });',
                    '            wrap.appendChild(lCol); wrap.appendChild(rCol); container.appendChild(wrap);',
                    '            if (!isAns && Object.keys(matches).length > 0) {',
                    '                var resetBtn = document.createElement("button");',
                    '                resetBtn.className = "matching-reset-btn";',
                    '                resetBtn.innerHTML = "🔄 مسح التوصيل وإعادة المحاولة";',
                    '                resetBtn.onclick = function() {',
                    '                    activeMatchingLeft = null; activeMatchingRight = null;',
                    '                    if (userAnswers[currentIndex]) userAnswers[currentIndex].matches = {};',
                    '                    renderMatching(q, container, isAns);',
                    '                };',
                    '                container.appendChild(resetBtn);',
                    '            }',
                    '        }',
                    '        function handleMatchUpdate(q, matches) {',
                    '            var pairs = q.pairs || [];',
                    '            if (!userAnswers[currentIndex]) userAnswers[currentIndex] = { answered: false, matches: {} };',
                    '            userAnswers[currentIndex].matches = matches;',
                    '            if (Object.keys(matches).length === pairs.length) {',
                    '                var isAll = pairs.every(function(p){ return matches[p.left] === p.right; });',
                    '                userAnswers[currentIndex].answered = true;',
                    '                userAnswers[currentIndex].correct = isAll;',
                    '                showQuestion();',
                    '                return;',
                    '            }',
                    '            showQuestion();',
                    '        }',
                    '        function prevQuestion() { if (currentIndex > 0) { currentIndex--; showQuestion(); window.scrollTo({top:0, behavior:"smooth"}); } }',
                    '        function nextQuestion() { if (currentIndex < questions.length - 1) { currentIndex++; showQuestion(); window.scrollTo({top:0, behavior:"smooth"}); } }',
                    '        function submitExam() {',
                    '            clearInterval(timerInterval);',
                    '            var correctCount = 0, autoTotal = 0;',
                    '            questions.forEach(function(q, i) {',
                    '                if (q.type === "matching" || q.pairs) {',
                    '                    autoTotal++;',
                    '                    var pairs = q.pairs || [];',
                    '                    var uMatches = (userAnswers[i] && userAnswers[i].matches) ? userAnswers[i].matches : {};',
                    '                    var isAll = pairs.length > 0 && pairs.every(function(p){ return uMatches[p.left] === p.right; });',
                    '                    if (!userAnswers[i]) userAnswers[i] = { answered: Object.keys(uMatches).length > 0, matches: uMatches };',
                    '                    userAnswers[i].answered = Object.keys(uMatches).length > 0;',
                    '                    userAnswers[i].correct = isAll;',
                    '                    if (isAll) correctCount++;',
                    '                } else if (q.type !== "essay") {',
                    '                    autoTotal++;',
                    '                    if (userAnswers[i] && userAnswers[i].correct) correctCount++;',
                    '                }',
                    '            });',
                    '            var wrongCount = autoTotal - correctCount;',
                    '            var pct = autoTotal > 0 ? Math.round((correctCount / autoTotal) * 100) : 0;',
                    '            showOfflineReport(correctCount, wrongCount, autoTotal, pct);',
                    '        }',
                    '        function showOfflineReport(correctCount, wrongCount, autoTotal, pct) {',
                    '            var bNav = document.getElementById("bottomNav");',
                    '            if (bNav) bNav.style.display = "none";',
                    '            var cont = document.getElementById("mainContainer");',
                    '            if (!cont) return;',
                    '            cont.innerHTML = "";',
                    '            var badgeBg = pct >= 85 ? "linear-gradient(135deg, #10B981, #059669)" : (pct >= 50 ? "linear-gradient(135deg, #F59E0B, #D97706)" : "linear-gradient(135deg, #EF4444, #DC2626)");',
                    '            var msg = pct >= 85 ? "ممتاز جداً! أداء رائع ومتميز 🌟" : (pct >= 50 ? "أحسنت! اجتزت الامتحان بنجاح 👍" : "تحتاج لمراجعة الدرس وحل أخطائك مرة أخرى 💪");',
                    '            var reportHtml = "<div style=\'text-align:center; margin-bottom:25px;\'>" +',
                    '                "<div style=\'font-size:55px; margin-bottom:8px;\'>🏆</div>" +',
                    '                "<h1 style=\'font-weight:900; font-size:24px; color:#1E3A8A;\'>نموذج الإجابة وتقرير الامتحان</h1>" +',
                    '                "<p style=\'font-size:14px; color:#64748B;\'>منصة الخطة التعليمية — تصحيح ومراجعة شاملة</p>" +',
                    '                "<div style=\'width:130px; height:130px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:20px auto 10px; background:" + badgeBg + "; color:white; box-shadow:0 8px 25px rgba(0,0,0,0.15);\'>" +',
                    '                    "<div style=\'font-size:32px; font-weight:900;\'>" + (autoTotal === 0 ? "📝" : pct + "%") + "</div>" +',
                    '                    "<div style=\'font-size:13px; font-weight:700;\'>النتيجة النهائية</div>" +',
                    '                "</div>" +',
                    '                "<div style=\'font-size:16px; font-weight:800; color:#334155;\'>" + msg + "</div>" +',
                    '            "</div>" +',
                    '            "<div style=\'display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; background:white; padding:18px; border-radius:20px; border:1px solid #E2E8F0; margin-bottom:25px; box-shadow:0 4px 15px rgba(0,0,0,0.02);\'>" +',
                    '                "<div><span style=\'color:#64748B; font-size:12px; display:block;\'>📝 الامتحان:</span><strong style=\'color:#1E293B;\'>" + safeTitle + "</strong></div>" +',
                    '                "<div><span style=\'color:#64748B; font-size:12px; display:block;\'>✅ الإجابات الصحيحة:</span><strong style=\'color:#16A34A;\'>" + correctCount + " من " + autoTotal + "</strong></div>" +',
                    '                "<div><span style=\'color:#64748B; font-size:12px; display:block;\'>❌ الأخطاء:</span><strong style=\'color:#DC2626;\'>" + wrongCount + "</strong></div>" +',
                    '            "</div>" +',
                    '            "<h2 style=\'color:#1E293B; font-size:20px; font-weight:900; margin-bottom:15px;\'>🔘 نموذج وتصحيح جميع الأسئلة:</h2>";',
                    '            questions.forEach(function(q, idx) {',
                    '                var ansObj = userAnswers[idx];',
                    '                var isAns = ansObj && ansObj.answered;',
                    '                var isCorrect = ansObj && ansObj.correct;',
                    '                var badge = q.type === "essay" ? "<span style=\'background:#EFF6FF; color:#1D4ED8; padding:4px 10px; border-radius:8px; font-weight:800; font-size:12px;\'>✍️ مقالي</span>" : (isCorrect ? "<span style=\'background:#DCFCE7; color:#166534; padding:4px 10px; border-radius:8px; font-weight:800; font-size:12px;\'>✅ صحيح</span>" : (isAns ? "<span style=\'background:#FEE2E2; color:#991B1B; padding:4px 10px; border-radius:8px; font-weight:800; font-size:12px;\'>❌ خطأ</span>" : "<span style=\'background:#F1F5F9; color:#64748B; padding:4px 10px; border-radius:8px; font-weight:800; font-size:12px;\'>⚪ لم يحل</span>"));',
                    '                var body = "";',
                    '                if (q.type === "essay") {',
                    '                    var studentAns = (ansObj && ansObj.text) ? ansObj.text : "لم تتم كتابة إجابة";',
                    '                    body = "<div style=\'background:#F8FAFC; border:1px solid #E2E8F0; padding:12px; border-radius:10px; margin-bottom:10px;\'><span style=\'font-size:13px; color:#64748B; display:block; font-weight:800;\'>✍️ إجابتك المكتوبة:</span><div style=\'font-weight:700; color:#1E293B; margin-top:4px;\'>" + studentAns + "</div></div><div style=\'background:#DCFCE7; border:1px solid #86EFAC; padding:12px; border-radius:10px;\'><span style=\'font-size:13px; color:#166534; display:block; font-weight:800;\'>✅ الإجابة النموذجية:</span><div style=\'font-weight:800; color:#15803D; margin-top:4px;\'>" + (q.explanation || "تتم المراجعة والتقييم مع المعلم") + "</div></div>";',
                    '                } else if (q.type === "matching" || q.pairs) {',
                    '                    var pairs = q.pairs || [];',
                    '                    var uMatches = ansObj && ansObj.matches ? ansObj.matches : {};',
                    '                    body = "<div style=\'display:flex; flex-direction:column; gap:6px;\'>" + pairs.map(function(p) {',
                    '                        var uRight = uMatches[p.left] || "لم يتم التوصيل";',
                    '                        var ok = uRight === p.right;',
                    '                        return "<div style=\'display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#F8FAFC; border:1.5px solid " + (ok ? "#86EFAC" : "#FECACA") + "; border-radius:10px; font-size:14px;\'><span><strong>" + p.left + "</strong> ➔ " + p.right + "</span><span style=\'font-weight:800; color:" + (ok ? "#16A34A" : "#DC2626") + "\'>" + (ok ? "✅ صحيح" : "❌ اختيارك: " + uRight) + "</span></div>";',
                    '                    }).join("") + "</div>";',
                    '                } else {',
                    '                    var opts = q.options || [];',
                    '                    var cIdx = q.correct;',
                    '                    var selIdx = ansObj ? ansObj.selectedIdx : null;',
                    '                    body = "<div>" + opts.map(function(opt, oIdx) {',
                    '                        var style = "background:#F8FAFC; border:1.5px solid #E2E8F0; color:#334155;";',
                    '                        var icon = "⚪";',
                    '                        if (oIdx === cIdx) { style = "background:#DCFCE7; border:2px solid #22C55E; color:#166534; font-weight:800;"; icon = "✅ (الإجابة النموذجية)"; }',
                    '                        else if (oIdx === selIdx && !isCorrect) { style = "background:#FEE2E2; border:2px solid #EF4444; color:#991B1B; font-weight:800;"; icon = "❌ (اختيارك)"; }',
                    '                        return "<div style=\'" + style + " padding:10px 14px; border-radius:10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; font-size:14px;\'><span>" + opt + "</span><span>" + icon + "</span></div>";',
                    '                    }).join("") + "</div>";',
                    '                }',
                    '                var exp = q.explanation ? "<div style=\'background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:12px; margin-top:10px; font-size:13px; color:#1E40AF;\'>💡 <strong>الشرح والتوضيح:</strong> " + q.explanation + "</div>" : "";',
                    '                reportHtml += "<div style=\'background:white; border:1px solid #E2E8F0; border-radius:18px; padding:20px; margin-bottom:15px; box-shadow:0 4px 15px rgba(0,0,0,0.02);\'>" +',
                    '                    "<div style=\'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;\'>" +',
                    '                        "<span style=\'font-weight:900; color:#4F46E5;\'>سؤال " + (idx + 1) + "</span>" + badge +',
                    '                    "</div>" +',
                    '                    "<div style=\'font-size:16px; font-weight:900; color:#1E293B; margin-bottom:14px;\'>" + q.text + "</div>" +',
                    '                    body + exp +',
                    '                "</div>";',
                    '            });',
                    '            reportHtml += "<div style=\'text-align:center; margin:30px 0;\'><button onclick=\'location.reload()\' style=\'background:#10B981; color:white; border:none; padding:14px 30px; border-radius:14px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 6px 20px rgba(16,185,129,0.3);\'>🔄 إعادة حل الامتحان من البداية</button></div>";',
                    '            cont.innerHTML = reportHtml;',
                    '            window.scrollTo({top:0, behavior:"smooth"});',
                    '        }',
                    '        showQuestion();',
                    '    <' + '/script>',
                    '    <script src="offline-overlay.js">