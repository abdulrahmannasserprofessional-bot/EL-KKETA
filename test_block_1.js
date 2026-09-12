'}
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

        function loadLessons() {
            database.ref('Lectures').on('value', (snap) => {
                allLessons = [];
                if (snap.exists()) {
                    if (snap.hasChild(subject)) {
                        snap.child(subject).forEach(c => {
                            allLessons.push({ id: c.key, ...c.val() });
                        });
                    } else {
                        snap.forEach(subSnap => {
                            if (subSnap.key.trim() === subject.trim()) {
                                subSnap.forEach(c => {
                                    allLessons.push({ id: c.key, ...c.val() });
                                });
                            }
                        });
                    }
                }
                
                // Render lectures immediately
                renderLessons(allLessons);

                // Fetch standalone exams in background
                database.ref('Exams').once('value').then(examSnap => {
                    if (examSnap.exists()) {
                        examSnap.forEach(child => {
                            const key = child.key;
                            const val = child.val();
                            
                            if ((key.trim() === subject.trim()) && typeof val === 'object' && !val.jsonCode && !val.title) {
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
                            } else if (val && ((val.subject && val.subject.trim() === subject.trim()) || (val.unit && val.unit.trim() === subject.trim()))) {
                                if (!allLessons.some(l => l.id === key || (val.title && l.title === val.title))) {
                                    allLessons.push({
                                        title: val.title || val.name || val.examName || "امتحان",
                                        isStandaloneExam: true,
                                        jsonCode: val.jsonCode,
                                        id: val.id || key
                                    });
                                }
                            }
                        });
                        renderLessons(allLessons);
                    }
                }).catch(e => console.warn("Exams query error:", e));
            }, (error) => {
                console.error("Lectures error:", error);
                renderLessons([]);
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

        // Offline HTML Exam Downloader
        function downloadOfflineExam(lessonTitle, lessonIdOrCode) {
            try {
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

                if (!questions || !Array.isArray(questions) || questions.length === 0) {
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

                const safeTitle = (lessonTitle || 'امتحان').replace(/[\\/:*?"<>|]/g, '').trim();

                const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} - نسخة أوفلاين</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
        :root {
            --primary: #4F46E5;
            --primary-dark: #3730A3;
            --bg: #F8FAFC;
            --surface: #FFFFFF;
            --text-main: #1E293B;
            --text-sub: #64748B;
            --border: #E2E8F0;
            --success: #10B981;
            --danger: #EF4444;
            --warning: #F59E0B;
        }
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; padding-bottom: 50px; }
        .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white; padding: 25px 20px; text-align: center;
            border-bottom-left-radius: 25px; border-bottom-right-radius: 25px;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
            position: sticky; top: 0; z-index: 100;
        }
        .header h1 { font-size: 20px; font-weight: 900; }
        .header p { font-size: 13px; opacity: 0.9; margin-top: 4px; }
        .container { max-width: 750px; margin: 25px auto 0; padding: 0 15px; }
        .progress-bar-wrap { background: #E2E8F0; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
        .progress-bar-fill { background: var(--primary); height: 100%; width: 0%; transition: width 0.3s; }
        .q-card {
            background: white; border-radius: 20px; padding: 25px; margin-bottom: 20px;
            border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            transition: all 0.2s;
        }
        .q-num { display: inline-block; background: #EEF2FF; color: var(--primary); font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 8px; margin-bottom: 12px; }
        .q-text { font-size: 17px; font-weight: 800; margin-bottom: 18px; line-height: 1.6; }
        .options-list { display: flex; flex-direction: column; gap: 10px; }
        .opt-btn {
            background: #F8FAFC; border: 2px solid var(--border); border-radius: 14px;
            padding: 14px 18px; text-align: right; font-size: 15px; font-weight: 700;
            cursor: pointer; transition: all 0.2s; color: var(--text-main);
            display: flex; align-items: center; justify-content: space-between;
        }
        .opt-btn:hover { border-color: var(--primary); background: #F1F5F9; }
        .opt-btn.selected { border-color: var(--primary); background: #EEF2FF; color: var(--primary); }
        .opt-btn.correct { border-color: var(--success) !important; background: #DCFCE7 !important; color: #166534 !important; }
        .opt-btn.wrong { border-color: var(--danger) !important; background: #FEE2E2 !important; color: #991B1B !important; }
        .explanation-box {
            background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px;
            padding: 14px; margin-top: 15px; font-size: 14px; color: #1E40AF; display: none;
        }
        .submit-btn {
            width: 100%; padding: 18px; background: linear-gradient(135deg, #10B981, #059669);
            color: white; border: none; border-radius: 16px; font-size: 18px; font-weight: 900;
            cursor: pointer; box-shadow: 0 8px 25px rgba(16,185,129,0.3); transition: all 0.2s;
            margin-top: 10px;
        }
        .submit-btn:hover { transform: translateY(-2px); opacity: 0.95; }
        .score-modal {
            display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 1000;
            align-items: center; justify-content: center; padding: 20px;
        }
        .score-modal.active { display: flex; }
        .score-card {
            background: white; border-radius: 25px; padding: 30px; max-width: 450px; width: 100%;
            text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .score-val { font-size: 48px; font-weight: 900; color: var(--primary); margin: 15px 0; }
        .btn-retry {
            width: 100%; padding: 14px; background: #EEF2FF; color: var(--primary);
            border: 2px solid #C7D2FE; border-radius: 14px; font-weight: 800; font-size: 15px;
            cursor: pointer; margin-top: 15px; transition: 0.2s;
        }
        .btn-retry:hover { background: #E0E7FF; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 ${safeTitle}</h1>
        <p>نسخة اختبار تفاعلية أوفلاين (تعمل بدون إنترنت)</p>
    </div>

    <div class="container">
        <div class="progress-bar-wrap">
            <div class="progress-bar-fill" id="pFill"></div>
        </div>

        <div id="questionsContainer"></div>

        <button class="submit-btn" id="submitBtn" onclick="finishExam()">إنهاء وتصحيح الامتحان 🚀</button>
    </div>

    <div class="score-modal" id="scoreModal">
        <div class="score-card">
            <div style="font-size: 50px;">🏆</div>
            <h2 style="font-size: 22px; font-weight: 900; margin-top: 10px;">نتيجة الامتحان</h2>
            <div class="score-val" id="scoreDisplay">0 / 0</div>
            <div id="scoreMsg" style="font-size: 15px; font-weight: 700; color: var(--text-sub);"></div>
            <button class="btn-retry" onclick="restartExam()">🔄 إعادة حل الامتحان من البداية</button>
            <button class="btn-retry" style="background:#1E293B; color:white; border-color:#1E293B; margin-top:8px;" onclick="closeModal()">🔍 مراجعة الإجابات والتفسير</button>
        </div>
    </div>

    ${'<script>'}
        const questions = ${JSON.stringify(questions)};
        let answers = {};
        let isSubmitted = false;

        function renderQuiz() {
            const container = document.getElementById('questionsContainer');
            container.innerHTML = '';
            answers = {};
            isSubmitted = false;
            document.getElementById('submitBtn').style.display = 'block';

            questions.forEach((q, idx) => {
                const card = document.createElement('div');
                card.className = 'q-card';
                card.id = 'q_' + idx;

                const qType = q.type || 'mcq';
                let bodyHtml = '';

                if (qType === 'essay') {
                    bodyHtml = `
                        <textarea id="ans_${idx}" placeholder="اكتب إجابتك هنا بالتفصيل..." rows="3" style="width:100%; padding:12px; border:2px solid #E2E8F0; border-radius:12px; font-size:15px; outline:none;"></textarea>
                        <div class="explanation-box" id="exp_${idx}">
                            <strong>الإجابة النموذجية:</strong><br>${q.modelAnswer || q.explanation || 'لا يوجد تفسير متاح'}
                        </div>
                    `;
                } else {
                    const options = q.options || [];
                    const optsHtml = options.map((opt, oIdx) => `
                        <button class="opt-btn" id="opt_${idx}_${oIdx}" onclick="selectOption(${idx}, ${oIdx})">
                            <span>${opt}</span>
                            <span class="opt-mark" style="font-size:14px;">⚪</span>
                        </button>
                    `).join('');

                    bodyHtml = `
                        <div class="options-list">${optsHtml}</div>
                        <div class="explanation-box" id="exp_${idx}">
                            💡 <strong>التفسير والتوضيح:</strong><br>${q.explanation || 'لا يوجد تفسير إضافي'}
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="q-num">السؤال ${idx + 1} من ${questions.length}</div>
                    <div class="q-text">${q.text || q.question || ''}</div>
                    ${bodyHtml}
                `;
                container.appendChild(card);
            });
            updateProgress();
        }

        function selectOption(qIdx, oIdx) {
            if (isSubmitted) return;
            answers[qIdx] = oIdx;
            const q = questions[qIdx];
            (q.options || []).forEach((_, i) => {
                const btn = document.getElementById(`opt_${qIdx}_${i}`);
                if (btn) {
                    btn.classList.toggle('selected', i === oIdx);
                    btn.querySelector('.opt-mark').textContent = (i === oIdx) ? '🔘' : '⚪';
                }
            });
            updateProgress();
        }

        function updateProgress() {
            const answeredCount = Object.keys(answers).length;
            const pct = Math.round((answeredCount / questions.length) * 100);
            document.getElementById('pFill').style.width = pct + '%';
        }

        function finishExam() {
            isSubmitted = true;
            let score = 0;
            let total = 0;

            questions.forEach((q, idx) => {
                const exp = document.getElementById('exp_' + idx);
                if (exp) exp.style.display = 'block';

                if (q.type === 'essay') {
                    total += 1;
                    score += 1;
                } else {
                    total += 1;
                    let correctIdx = q.correct;
                    if (correctIdx === undefined && q.correctAnswerIndex !== undefined) correctIdx = q.correctAnswerIndex;
                    if (correctIdx === undefined && q.answer !== undefined && typeof q.answer === 'number') correctIdx = q.answer;
                    if (correctIdx === undefined && q.correctAnswer !== undefined && q.options) {
                        const fOpt = q.options.indexOf(q.correctAnswer);
                        if (fOpt !== -1) correctIdx = fOpt;
                    }
                    if (correctIdx === undefined) correctIdx = 0;
                    const userSelected = answers[idx];

                    if (userSelected !== undefined) {
                        const userBtn = document.getElementById(`opt_${idx}_${userSelected}`);
                        if (userSelected == correctIdx) {
                            score += 1;
                            if (userBtn) userBtn.classList.add('correct');
                        } else {
                            if (userBtn) userBtn.classList.add('wrong');
                            const correctBtn = document.getElementById(`opt_${idx}_${correctIdx}`);
                            if (correctBtn) correctBtn.classList.add('correct');
                        }
                    } else {
                        const correctBtn = document.getElementById(`opt_${idx}_${correctIdx}`);
                        if (correctBtn) correctBtn.classList.add('correct');
                    }
                }
            });

            document.getElementById('submitBtn').style.display = 'none';
            document.getElementById('scoreDisplay').textContent = `${score} / ${total}`;
            const pct = Math.round((score / total) * 100);
            let msg = 'أحسنت عملاً! 🎉';
            if (pct < 50) msg = 'تحتاج إلى مراجعة الدرس مرة أخرى 💪';
            else if (pct >= 85) msg = 'ممتاز جداً! درجة مشرفة 🌟';
            document.getElementById('scoreMsg').textContent = msg;

            document.getElementById('scoreModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('scoreModal').classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function restartExam() {
            document.getElementById('scoreModal').classList.remove('active');
            renderQuiz();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        renderQuiz();
    