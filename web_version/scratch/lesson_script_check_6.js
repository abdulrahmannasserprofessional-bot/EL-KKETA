
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject') || "المادة الدراسية";
        document.getElementById('subjectTitle').innerText = subject;

        const user = JSON.parse(localStorage.getItem('user'));
        let currentLectureTitle = "";
        let notesTimeout = null;

        let allLessons = [];
        let currentCategory = 'all';

        function loadLessons() {
            database.ref('Lectures').child(subject).on('value', (snapshot) => {
                allLessons = [];
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        allLessons.push(child.val());
                    });
                }
                
                // Load standalone Exams (support both new nested and old flat structure)
                database.ref('Exams').on('value', (examSnap) => {
                    if (examSnap.exists()) {
                        examSnap.forEach(child => {
                            const key = child.key;
                            const val = child.val();
                            
                            // Check if it's the subject node itself
                            if (key === subject && typeof val === 'object' && !val.jsonCode && !val.title && !val.name) {
                                Object.keys(val).forEach(examId => {
                                    const ex = val[examId];
                                    if (ex) {
                                        allLessons.push({
                                            title: ex.title || ex.name || ex.examName || "امتحان",
                                            isStandaloneExam: true,
                                            jsonCode: ex.jsonCode,
                                            id: ex.id || examId
                                        });
                                    }
                                });
                            } 
                            // Otherwise check if it's an old flat structure exam matching the subject
                            else if (val && (val.subject === subject || val.unit === subject)) {
                                allLessons.push({
                                    title: val.title || val.name || val.examName || "امتحان",
                                    isStandaloneExam: true,
                                    jsonCode: val.jsonCode,
                                    id: val.id || key
                                });
                            }
                        });
                    }
                    renderLessons(allLessons);
                });
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

            // Group by chapter
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
                            if (isLocked) {
                                groupItemsHTML.push(`
                                    <div class="card" style="opacity: 0.8; margin:0 0 12px 0; background: #FFFBEB; border: 1px solid #FDE68A;">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <div style="width:48px; height:48px; background:#FBBF24; color:white; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:24px;">🔒</div>
                                            <div>
                                                <strong style="font-size:15px; display:block; color:#92400E; margin-bottom: 2px;">${lesson.title}</strong>
                                                ${descHTML}
                                                ${lockHTML}
                                            </div>
                                        </div>
                                    </div>
                                `);
                            } else {
                                groupItemsHTML.push(`
                                    <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin:0 0 12px 0; cursor:pointer;" onclick="window.location.href='quiz.html?examId=${encodeURIComponent(lesson.id)}&subject=${encodeURIComponent(subject)}&title=${encodeURIComponent(lesson.title)}'">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <div style="width:48px; height:48px; background:#E8F8F5; color:#00B894; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:24px;">📝</div>
                                            <div>
                                                <strong style="font-size:15px; display:block;">${lesson.title}</strong>
                                                <div style="margin-top: 4px;">${badgesHTML}</div>
                                                ${descHTML}
                                            </div>
                                        </div>
                                        <span style="background:rgba(0,184,148,0.1); color:#00B894; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">بدء</span>
                                    </div>
                                `);
                            }
                        }
                        return;
                    }

                    if (currentCategory === 'all') {
                        hasItemsForCurrentView = true;
                        if (isLocked) {
                            groupItemsHTML.push(`
                                <div class="lesson-package" style="opacity: 0.8; background: #FFFBEB; border-color: #FDE68A;">
                                    <div class="lesson-header-row" style="border: none;">
                                        <div class="lesson-title-area">
                                            <div class="lesson-number" style="background: #FBBF24; color: white; border: none; box-shadow: none;">🔒</div>
                                            <div class="lesson-info">
                                                <h4 style="color: #92400E; margin-bottom: 2px;">${lesson.title}</h4>
                                                <div style="margin-top: 4px;">${badgesHTML}</div>
                                                ${descHTML}
                                                ${lockHTML}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `);
                        } else {
                            groupItemsHTML.push(`
                                <div class="lesson-package">
                                    <div class="lesson-header-row">
                                        <div class="lesson-title-area">
                                            <div class="lesson-number">${index+1}</div>
                                            <div class="lesson-info">
                                                <h4>${lesson.title}</h4>
                                                <div style="margin-top: 4px;"><span>⏱️ ${lesson.duration || 'متوفر'}</span> ${badgesHTML}</div>
                                                ${descHTML}
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
                                          ${lesson.jsonCode || lesson.examUrl || lesson.isStandaloneExam || 
lesson.hasQuiz !== false 
                                            ? `<button class="action-btn btn-quiz" onclick="startExam('${escTitle}', '${(lesson.jsonCode||'').replace(/'/g, "\\'")}')"><i>📝</i> امتحان</button>` 
                                            : `<button class="action-btn btn-disabled" onclick="showToast('الامتحان غير متوفر حالياً', 'warning')"><i style="filter: grayscale(1);">📝</i> غير متوفر</button>`}
                                    </div>
                                </div>
                            `);
                        }
                    } else if (currentCategory === 'videos' && lesson.videoUrl) {
                        hasItemsForCurrentView = true;
                        if (isLocked) {
                            groupItemsHTML.push(`
                                <div class="card" style="opacity: 0.8; margin-bottom: 12px; background: #FFFBEB; border: 1px solid #FDE68A;">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#FBBF24; color:white; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">🔒</div>
                                        <div><strong style="font-size:14px; display:block; color:#92400E;">${lesson.title}</strong><span style="font-size:11px; color:#B45309;">فيديو المحاضرة</span></div>
                                    </div>
                                    ${lockHTML}
                                </div>
                            `);
                        } else {
                            groupItemsHTML.push(`
                                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;" onclick="openVideoPlayer('${escVideoUrl}', '${escTitle}')">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#EEF2FF; color:#4F46E5; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📺</div>
                                        <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">فيديو المحاضرة</span></div>
                                    </div>
                                    <span style="background:rgba(79,70,229,0.1); color:#4F46E5; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">تشغيل</span>
                                </div>
                            `);
                        }
                    } else if (currentCategory === 'pdfs' && lesson.pdfUrl) {
                        hasItemsForCurrentView = true;
                        if (isLocked) {
                            groupItemsHTML.push(`
                                <div class="card" style="opacity: 0.8; margin-bottom: 12px; background: #FFFBEB; border: 1px solid #FDE68A;">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#FBBF24; color:white; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">🔒</div>
                                        <div><strong style="font-size:14px; display:block; color:#92400E;">${lesson.title}</strong><span style="font-size:11px; color:#B45309;">ملخص المحاضرة</span></div>
                                    </div>
                                    ${lockHTML}
                                </div>
                            `);
                        } else {
                            groupItemsHTML.push(`
                                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;" onclick="openPdf('${escPdfUrl}')">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#FEF2F2; color:#DC2626; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📄</div>
                                        <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">ملخص المحاضرة</span></div>
                                    </div>
                                    <span style="background:rgba(220,38,38,0.1); color:#DC2626; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">فتح</span>
                                </div>
                            `);
                        }
                    } else if (currentCategory === 'quizzes' && (lesson.jsonCode || lesson.examUrl || lesson.hasQuiz !== false)) {
                        hasItemsForCurrentView = true;
                        if (isLocked) {
                            groupItemsHTML.push(`
                                <div class="card" style="opacity: 0.8; margin-bottom: 12px; background: #FFFBEB; border: 1px solid #FDE68A;">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#FBBF24; color:white; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">🔒</div>
                                        <div><strong style="font-size:14px; display:block; color:#92400E;">${lesson.title}</strong><span style="font-size:11px; color:#B45309;">امتحان المحاضرة</span></div>
                                    </div>
                                    ${lockHTML}
                                </div>
                            `);
                        } else {
                            groupItemsHTML.push(`
                                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; cursor:pointer;" onclick="startExam('${escTitle}', '${(lesson.jsonCode||'').replace(/'/g, "\\'")}')">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:40px; height:40px; background:#E8F8F5; color:#00B894; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;">📝</div>
                                        <div><strong style="font-size:14px; display:block;">${lesson.title}</strong><span style="font-size:11px; color:var(--text-sub);">امتحان المحاضرة</span></div>
                                    </div>
                                    <span style="background:var(--accent); color:white; padding:6px 12px; border-radius:10px; font-weight:bold; font-size:11px;">ابدأ الامتحان 🚀</span>
                                </div>
                            `);
                        }
                    }
                });

                if (hasItemsForCurrentView) {
                    const groupContainer = document.createElement('div');
                    groupContainer.style.marginBottom = '25px';
                    
                    // Display Chapter header if it's not the default one or if there are multiple chapters
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

        // Custom Video Player Handlers
        const player = document.getElementById('customVideoPlayer');
        
        player.addEventListener('timeupdate', () => {
            if (player.currentTime > 0 && currentLectureTitle) {
                const key = `video_progress_${user ? user.studentCode : 'guest'}_${currentLectureTitle}`;
                localStorage.setItem(key, player.currentTime);
            }
        });

        function openVideoPlayer(videoUrl, title) {
            currentLectureTitle = title;
            document.getElementById('modalVideoTitle').innerText = title;

            const directPlayer = document.getElementById('customVideoPlayer');
            const driveFrame = document.getElementById('driveIframe');
            const mobileFallback = document.getElementById('driveMobileFallback');
            const btnOpenDrive = document.getElementById('btnOpenDrive');
            const speedControls = document.getElementById('speedControls');
            const vc = document.getElementById('videoContainer');

            // Detect Google Drive link and convert to embed URL
            let driveFileId = null;
            if (videoUrl) {
                const driveMatch = videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (driveMatch) driveFileId = driveMatch[1];
            }

            if (driveFileId) {
                directPlayer.style.display = 'none';
                directPlayer.src = '';
                speedControls.style.display = 'none'; // Can't control iframe playback rate
                vc.style.paddingBottom = '0';
                
                if (window.innerWidth <= 768) {
                    // Mobile: Show Fallback Button to trigger fullscreen
                    driveFrame.style.display = 'block'; // Keep iframe behind it
                    driveFrame.src = `https://drive.google.com/file/d/${driveFileId}/preview`;
                    mobileFallback.style.display = 'flex';
                    vc.style.height = '35vh';
                    vc.style.minHeight = '250px';
                    
                    btnOpenDrive.onclick = () => {
                        mobileFallback.style.display = 'none'; // hide the overlay
                        const elem = document.getElementById('videoContainer');
                        if (elem.requestFullscreen) {
                            elem.requestFullscreen();
                        } else if (elem.webkitRequestFullscreen) {
                            elem.webkitRequestFullscreen();
                        } else if (elem.msRequestFullscreen) {
                            elem.msRequestFullscreen();
                        }
                    };
                } else {
                    // Desktop: Show Iframe
                    mobileFallback.style.display = 'none';
                    driveFrame.style.display = 'block';
                    driveFrame.src = `https://drive.google.com/file/d/${driveFileId}/preview`;
                    vc.style.height = '50vh';
                    vc.style.minHeight = '400px'; 
                }
            } else if (videoUrl && videoUrl !== 'undefined' && videoUrl !== 'null') {
                // Regular direct video URL
                driveFrame.style.display = 'none';
                driveFrame.src = '';
                mobileFallback.style.display = 'none';
                directPlayer.style.display = 'block';
                speedControls.style.display = 'flex';
                
                vc.style.height = '0';
                vc.style.minHeight = '0';
                vc.style.paddingBottom = '56.25%'; // Standard 16:9
                
                directPlayer.src = videoUrl;

                // Restore saved position
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

            // Save last accessed lesson for Home screen widget shortcut
            if (subject && title) {
                localStorage.setItem('last_accessed_subject', subject);
                localStorage.setItem('last_accessed_lecture', title);
            }

            // Set playback speed back to 1.0x by default
            player.playbackRate = 1.0;
            document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.speed-btn[onclick*="1,"]').classList.add('active');

            // Restore playback time if saved
            const savedTime = localStorage.getItem(`video_progress_${user ? user.studentCode : 'guest'}_${title}`);
            if (savedTime) {
                const onLoaded = () => {
                    player.currentTime = parseFloat(savedTime);
                    player.removeEventListener('loadedmetadata', onLoaded);
                };
                player.addEventListener('loadedmetadata', onLoaded);
            }

            // Load notes from Firebase
            document.getElementById('lessonNotes').value = "جاري تحميل ملاحظاتك...";
            if (user && user.studentCode) {
                database.ref(`Students/${user.studentCode}/Notes/${title}`).once('value').then(snap => {
                    document.getElementById('lessonNotes').value = snap.val() || "";
                });
            } else {
                document.getElementById('lessonNotes').value = "";
            }

            document.getElementById('playerModal').classList.add('active');
            player.play().catch(e => console.log("Auto-play blocked, waiting for user"));
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

        // Debounced notes saving to Firebase
        function saveNotes() {
            if (!user || !user.studentCode || !currentLectureTitle) return;
            const notesText = document.getElementById('lessonNotes').value;
            
            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(() => {
                database.ref(`Students/${user.studentCode}/Notes/${currentLectureTitle}`).set(notesText);
            }, 800);
        }

        function startExam(lessonTitle, jsonCode) {
            if (jsonCode && jsonCode.trim() !== "") {
                window.location.href = `quiz.html?exam=${encodeURIComponent(jsonCode)}&subject=${encodeURIComponent(subject)}`;
                return;
            }

            // Search in both old flat structure (Exams/{examId}) and new nested (Exams/{subject}/{examId})
            database.ref('Exams').once('value').then(snap => {
                let foundExam = null;

                snap.forEach(child => {
                    if (foundExam) return;
                    const val = child.val();
                    // New nested structure: child = subject node
                    if (val && typeof val === 'object' && !val.jsonCode && !val.title && !val.name) {
                        Object.values(val).forEach(exam => {
                            if (foundExam) return;
                            if (exam && exam.jsonCode) foundExam = exam;
                        });
                    } else if (val && val.jsonCode) {
                        // Old flat structure
                        foundExam = val;
                    }
                });

                if (foundExam && foundExam.jsonCode) {
                    window.location.href = `quiz.html?exam=${encodeURIComponent(foundExam.jsonCode)}&subject=${encodeURIComponent(subject)}`;
                } else {
                    window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
                }
            }).catch(() => {
                window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
            });
        }
        // Radar Logging
        function logActivity(actionDetails) {
            if(!user || !user.studentCode) return;
            const logRef = database.ref('ActivityLogs').push();
            logRef.set({
                studentCode: user.studentCode,
                studentName: user.fullName || 'طالب',
                action: actionDetails,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }

        // Session Management
        const localDeviceId = localStorage.getItem('deviceId');
        if (user && localDeviceId) {
            database.ref('ActiveSessions/' + user.studentCode).on('value', snap => {
                if(snap.exists() && snap.val() !== localDeviceId) {
                    alert("⚠️ تم تسجيل الدخول من جهاز آخر! سيتم تسجيل خروجك.");
                    localStorage.removeItem('user');
                    localStorage.removeItem('deviceId');
                    window.location.href = "index.html";
                }
            });
        }

        loadLessons();

        // Hook openVideo and startExam to Radar
        const originalOpenVideo = openVideo;
        openVideo = function(title, videoUrl, pdfUrl) {
            logActivity("بدأ مشاهدة فيديو: " + title);
            originalOpenVideo(title, videoUrl, pdfUrl);
        };

        const originalStartExam = startExam;
        startExam = function(lessonTitle, jsonCode) {
            logActivity("دخل امتحان: " + (lessonTitle || "غير محدد"));
            originalStartExam(lessonTitle, jsonCode);
        };
    