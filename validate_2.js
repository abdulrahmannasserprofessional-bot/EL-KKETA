
        function requestUpdateEmailOTP() {
            const emailInput = document.getElementById('updateEmailInput').value.trim();
            if (!emailInput) {
                showToast('يرجى إدخال البريد الإلكتروني', 'warning');
                return;
            }
            if (user && user.studentCode) {
                user.email = emailInput;
                database.ref('Students/' + user.studentCode).update({ email: emailInput }).then(() => {
                    localStorage.setItem('user', JSON.stringify(user));
                    const modal = document.getElementById('missingEmailModal');
                    if (modal) modal.classList.remove('active');
                    showToast("تم حفظ بريدك الإلكتروني بنجاح 🎉", "success");
                });
            }
        }

        function toggleTheme() {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                showToast("تم التفعيل: المظهر المضيء ☀️", "info");
            } else {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                showToast("تم التفعيل: المظهر الداكن 🌙", "info");
            }
        }


        
        const user = JSON.parse(localStorage.getItem('user'));
        const localDeviceId = localStorage.getItem('deviceId');
        
        if (user) {
            document.getElementById('userName').innerText = "أهلاً بك يا " + user.fullName;
            
            // Dynamic Time Greeting
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                document.getElementById('greetingText').innerText = "صباح الخير والنشاط! ☀️";
            } else if (hour >= 12 && hour < 18) {
                document.getElementById('greetingText').innerText = "مساء الخير والهمة العالية! 🌤️";
            } else {
                document.getElementById('greetingText').innerText = "مساء الخير والهدوء! 🌙";
            }

            // Listen for personal message from admin
            database.ref('Students/' + user.studentCode + '/personalMessage').on('value', (snap) => {
                const msg = snap.val();
                if (msg) {
                    document.getElementById('personalNoticeBar').style.display = 'flex';
                    document.getElementById('personalNoticeText').innerText = msg;
                } else {
                    document.getElementById('personalNoticeBar').style.display = 'none';
                }
            });

            // Listen for ban status in real time
            database.ref('Students/' + user.studentCode + '/isBanned').on('value', (snap) => {
                if (snap.val() === true) {
                    alert('⚠️ تم إيقاف هذا الحساب من قبل إدارة المنصة.');
                    logout();
                }
            });

            // Load user points & stats from Firebase
            database.ref('Students/' + user.studentCode + '/stats').on('value', (snap) => {
                const stats = snap.val() || { totalScore: 0, examsTaken: 0 };
                const points = stats.totalScore || 0;
                document.getElementById('userPoints').innerText = points;

                // Level calculation
                const level = Math.floor(points / 200) + 1;
                document.getElementById('userLevel').innerText = `مستوى ${level}`;
            });
        } else {
            window.location.href = "index.html";
        }

        function dismissPersonalNotice() {
            if (user && user.studentCode) {
                database.ref('Students/' + user.studentCode + '/personalMessage').remove();
            }
            document.getElementById('personalNoticeBar').style.display = 'none';
        }

        // Drawer Logic
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('overlay');
        document.getElementById('openDrawer').onclick = () => {
            drawer.classList.add('active');
            overlay.classList.add('active');
        };
        overlay.onclick = () => {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
        };

        function logout() {
            localStorage.removeItem('user');
            window.location.href = "index.html";
        }

        database.ref('Settings/LatestNotification').on('value', (snap) => {
            const notice = snap.val() || "لا توجد تنبيهات جديدة حالياً";
            document.getElementById('latestNotice').innerText = notice;
        });

        // Resume Last Lesson Check
        const lastSubject = localStorage.getItem('last_accessed_subject');
        const lastLecture = localStorage.getItem('last_accessed_lecture');
        if (lastSubject && lastLecture) {
            document.getElementById('resumeWidget').style.display = 'flex';
            document.getElementById('resumeTitle').innerText = `${lastSubject}: ${lastLecture}`;
        }

        function resumeLastLesson() {
            if (lastSubject) {
                location.href = `lectures.html?subject=${encodeURIComponent(lastSubject)}`;
            }
        }
    