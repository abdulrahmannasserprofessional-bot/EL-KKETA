
        // ─── State ───
        let questions = [];
        let currentIndex = 0;
        let correctCount = 0;
        let pendingEssays = []; // To store essay answers
        let timerSeconds = 60 * 60; // 1 hour
        let timerInterval = null;
        
        const urlParams = new URLSearchParams(window.location.search);
        const subjectName = urlParams.get('subject') || 'امتحان';
        const mode = urlParams.get('mode');
        const examId = urlParams.get('examId') || 'unknown'; // Get examId from URL or similar if possible, otherwise we use subjectName
        
        document.getElementById('subjectLabel').textContent = subjectName;
        
        const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
        
        // ─── Toast ───
        function showToast(msg, type = 'info', duration = 3000) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            if(type === 'success') t.style.borderBottom = '3px solid #22c55e';
            else if(type === 'error') t.style.borderBottom = '3px solid #ef4444';
            else if(type === 'warning') t.style.borderBottom = '3px solid #f59e0b';
            else t.style.borderBottom = '3px solid #3b82f6';
            t.className = 'show';
            setTimeout(() => { t.className = t.className.replace('show',''); }, duration);
        }
        
        // ─── Timer ───
        function startTimer() {
            const timerEl = document.getElementById('timer');
            const timerBox = document.getElementById('timerBox');
            timerInterval = setInterval(() => {
                timerSeconds--;
                const m = Math.floor(timerSeconds / 60);
                const s = timerSeconds % 60;
                timerEl.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
                if (timerSeconds <= 300) timerBox.classList.add('danger');
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    finishQuiz();
                }
            }, 1000);
        }
        
        // ─── Render Question ───
        function showQuestion() {
            if (currentIndex >= questions.length) { finishQuiz(); return; }
            
            const q = questions[currentIndex];
            const pct = ((currentIndex) / questions.length) * 100;
            
            document.getElementById('progressText').textContent = `السؤال ${currentIndex + 1} / ${questions.length}`;
            document.getElementById('quizProgressBar').style.width = pct + '%';
            
            // Type badge
            let badgeText = '📝 سؤال اختياري';
            if (q.type === 'essay') {
                badgeText = '✍️ سؤال مقالي';
            } else if (q.type === 'matching') {
                window.currentRightItems = q.pairs.map(p => ({text: p.right, correctLeft: p.left}));
                window.currentLeftItems = q.pairs.map(p => p.left);
                window.currentLeftItems.sort(() => Math.random() - 0.5);

                const containerGrid = document.createElement('div');
                containerGrid.style.cssText = 'display: flex; gap: 15px; margin-bottom: 20px;';
                
                const colRight = document.createElement('div');
                colRight.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 10px;';
                
                const colLeft = document.createElement('div');
                colLeft.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 10px;';

                let selectedRightIdx = null;
                window.currentLinks = {}; // rightIdx -> leftIdx

                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#3f6212', '#be123c', '#1d4ed8', '#b45309'];
                
                function updateUI() {
                    Array.from(colRight.children).forEach((btn, rIdx) => {
                        btn.style.border = selectedRightIdx === rIdx ? '2px solid #3b82f6' : '1px solid #ccc';
                        btn.style.backgroundColor = 'white';
                        btn.style.color = 'black';
                        btn.innerHTML = window.currentRightItems[rIdx].text;
                        
                        if (window.currentLinks[rIdx] !== undefined) {
                            const c = colors[rIdx % colors.length];
                            btn.style.backgroundColor = c;
                            btn.style.color = 'white';
                            btn.style.border = 'none';
                            btn.innerHTML = `<span style="background: rgba(255,255,255,0.3); border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px;">${rIdx + 1}</span>` + btn.innerHTML;
                        }
                    });

                    Array.from(colLeft.children).forEach((btn, lIdx) => {
                        btn.style.backgroundColor = 'white';
                        btn.style.color = 'black';
                        btn.style.border = '1px solid #ccc';
                        btn.innerHTML = window.currentLeftItems[lIdx];
                        
                        const linkedRIdx = Object.keys(window.currentLinks).find(r => window.currentLinks[r] === lIdx);
                        if (linkedRIdx !== undefined) {
                            const c = colors[linkedRIdx % colors.length];
                            btn.style.backgroundColor = c;
                            btn.style.color = 'white';
                            btn.style.border = 'none';
                            btn.innerHTML = `<span style="background: rgba(255,255,255,0.3); border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px;">${parseInt(linkedRIdx) + 1}</span>` + btn.innerHTML;
                        }
                    });
                }

                window.currentRightItems.forEach((item, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'matching-col-btn';
                    btn.style.cssText = 'padding: 12px; border-radius: 10px; text-align: center; cursor: pointer; transition: 0.2s; min-height: 50px; font-family: inherit; font-size: 14px; width: 100%;';
                    btn.onclick = () => {
                        if (window.currentLinks[idx] !== undefined) {
                            delete window.currentLinks[idx];
                            selectedRightIdx = idx;
                        } else {
                            selectedRightIdx = idx;
                        }
                        updateUI();
                    };
                    colRight.appendChild(btn);
                });

                window.currentLeftItems.forEach((item, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'matching-col-btn';
                    btn.style.cssText = 'padding: 12px; border-radius: 10px; text-align: center; cursor: pointer; transition: 0.2s; min-height: 50px; font-family: inherit; font-size: 14px; width: 100%;';
                    btn.onclick = () => {
                        if (selectedRightIdx !== null) {
                            Object.keys(window.currentLinks).forEach(r => {
                                if (window.currentLinks[r] === idx) delete window.currentLinks[r];
                            });
                            window.currentLinks[selectedRightIdx] = idx;
                            selectedRightIdx = null;
                            updateUI();
                        } else {
                            const linkedRIdx = Object.keys(window.currentLinks).find(r => window.currentLinks[r] === idx);
                            if (linkedRIdx !== undefined) {
                                delete window.currentLinks[linkedRIdx];
                                updateUI();
                            } else {
                                showToast("?????? ?????? ???? ?? ?????? ????? ?????");
                            }
                        }
                    };
                    colLeft.appendChild(btn);
                });

                updateUI();
                
                containerGrid.appendChild(colRight);
                containerGrid.appendChild(colLeft);
                
                const submitBtn = document.createElement('button');
                submitBtn.textContent = '????? ???????';
                submitBtn.style.cssText = 'width: 100%; padding: 16px; background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; border: none; border-radius: 15px; font-family: inherit; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s;';
                submitBtn.onclick = () => checkMatchingAnswerGrid(q);
                
                container.appendChild(containerGrid);
                container.appendChild(submitBtn);
            } else {
                (q.options || []).forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.innerHTML = `
                        <span class="option-letter">${OPTION_LETTERS[idx] || (idx+1)}</span>
                        <span>${opt}</span>
                    `;
                    btn.onclick = () => checkAnswer(idx);
                    container.appendChild(btn);
                });
            }
        }

        // ─── Submit Essay Answer ───
        function submitEssayAnswer(q) {
            const textarea = document.getElementById('essayAnswerText');
            const answer = textarea.value.trim();
            
            if (!answer) {
                showToast("يرجى كتابة الإجابة قبل الإرسال", "warning");
                return;
            }
            
            q.studentAnswer = answer;
            pendingEssays.push(q);
            
            // Show feedback
            const feedCard = document.getElementById('feedbackCard');
            feedCard.style.display = 'block';
            feedCard.className = 'feedback-card correct-card'; // Use correct card style for neutral info
            
            let feedHTML = `
                <div class="feedback-status" style="margin-bottom: 15px;">
                    ✅ <span style="color:#3b82f6;">تم حفظ إجابتك. سيتم عرض الإجابة النموذجية لتقييم نفسك في نهاية الامتحان.</span>
                </div>
            `;
            

            feedHTML += `
                <button class="next-btn" id="nextBtn">${currentIndex < questions.length - 1 ? 'السؤال التالي ⬅️' : '🎉 إنهاء الامتحان'}</button>
            `;
            feedCard.innerHTML = feedHTML;
            
            document.getElementById('nextBtn').onclick = () => {
                currentIndex++;
                showQuestion();
            };
            
            textarea.disabled = true;
            textarea.nextElementSibling.disabled = true;
            textarea.nextElementSibling.style.opacity = '0.5';
            feedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // ─── Check Matching Answer ───
        function checkMatchingAnswerGrid(q) {
            let isCorrect = true;
            let allAnswered = true;
            
            if (Object.keys(window.currentLinks).length < q.pairs.length) {
                showToast("???? ????? ?? ??????? ??? ???????", "warning");
                return;
            }
            
            window.currentRightItems.forEach((r, rIdx) => {
                const linkedLIdx = window.currentLinks[rIdx];
                if (linkedLIdx === undefined) {
                    allAnswered = false;
                } else {
                    const selectedLeftText = window.currentLeftItems[linkedLIdx];
                    if (selectedLeftText !== r.correctLeft) {
                        isCorrect = false;
                    }
                }
            });
            
            if (!allAnswered) {
                showToast("???? ????? ?? ??????? ??? ???????", "warning");
                return;
            }
            
            // disable buttons
            document.querySelectorAll(".matching-col-btn").forEach(btn => btn.disabled = true);
            
            if (isCorrect) {
                correctCount++;
                playCorrectSound();
            } else {
                playWrongSound();
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');
                if (!mistakes.some(m => m.text === q.text)) {
                    mistakes.push({ ...q, questionText: q.text, subjectName, examId: window.currentExamId || urlParams.get('examId') || '??????' });
                    localStorage.setItem('mistakes_list', JSON.stringify(mistakes));
                }
            }

            // Track Analytics in Firebase
            try {
                const cExamId = window.currentExamId || urlParams.get('examId') || '??????';
                const cleanSubject = (subjectName || '????').replace(/[.#$\[\]]/g, '');
                const cleanExam = cExamId.replace(/[.#$\[\]]/g, '');
                let hash = 0;
                for (let i = 0; i < q.text.length; i++) hash = Math.imul(31, hash) + q.text.charCodeAt(i) | 0;
                const qId = 'q_' + Math.abs(hash);
                
                const qRef = database.ref(`ExamAnalytics/${cleanSubject}/${cleanExam}/${qId}`);
                qRef.child('questionText').set(q.text);
                qRef.child('correctAnswer').set('???? ????? (Matching)');
                qRef.child('explanation').set(q.explanation || '?? ???? ?????');
                
                if (!isCorrect) {
                    qRef.child('totalMistakes').set(firebase.database.ServerValue.increment(1));
                    qRef.child(`choices/?????_?????_??_???????`).set(firebase.database.ServerValue.increment(1));
                }
            } catch(err) {
                console.error("Analytics Error", err);
            }
            
            // Show feedback
            const feedCard = document.getElementById('feedbackCard');
            feedCard.style.display = 'block';
            feedCard.className = 'feedback-card ' + (isCorrect ? 'correct-card' : 'wrong-card');
            
            let feedHTML = `
                <div class="feedback-status">
                    ${isCorrect ? '? <span style="color:#22c55e;">????? ?????! ????? ??</span>' : '? <span style="color:#ef4444;">????? ????? ?? ??? ?? ?? ??????????</span>'}
                </div>
            `;
            
            if (!isCorrect) {
                feedHTML += `<div class="correct-answer-box" style="margin-top: 10px;">?? ??????? ??????:<br>`;
                q.pairs.forEach(p => {
                    feedHTML += `<div style="margin-top:5px; font-size:14px;">- <b>${p.right}</b> ?? <b>${p.left}</b></div>`;
                });
                feedHTML += `</div>`;
            }
            
            if (q.explanation) {
                feedHTML += `<div class="explanation-text">${q.explanation.replace(/\*\*(.*?)\*\*/g, '<mark style="background-color: #FBBF24; color: #1A1D2E; padding: 2px 6px; border-radius: 4px; font-weight: bold;">$1</mark>')}</div>`;
            }
            
            feedHTML += `<button class="next-btn" id="nextBtn">${currentIndex < questions.length - 1 ? '?????? ?????? ??' : '?? ????? ????????'}</button>`;
            feedCard.innerHTML = feedHTML;
            
            document.getElementById('nextBtn').onclick = () => {
                currentIndex++;
                showQuestion();
            };
            
            feedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // --- Check Answer ---
        function checkAnswer(selectedIdx) {
            const q = questions[currentIndex];
            const correctIdx = q.correct !== undefined ? q.correct : (q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0);
            const isCorrect = selectedIdx === correctIdx;
            
            // Disable all buttons and highlight
            document.querySelectorAll('.option-btn').forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === correctIdx) btn.classList.add('correct');
                else if (idx === selectedIdx && !isCorrect) btn.classList.add('wrong');
            });
            
            if (isCorrect) {
                correctCount++;
                // Remove from mistakes if in normal mode
                if (mode === 'mistakes') {
                    let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');
                    mistakes = mistakes.filter(m => m.text !== q.text);
                    localStorage.setItem('mistakes_list', JSON.stringify(mistakes));
                }
            } else {
                // Save to mistakes bank
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');
                if (!mistakes.some(m => m.text === q.text)) {
                    mistakes.push({ ...q, questionText: q.text, subjectName, examId: window.currentExamId || urlParams.get('examId') || 'امتحان' });
                    localStorage.setItem('mistakes_list', JSON.stringify(mistakes));
                }
                
                // Track Analytics in Firebase (Admin Mistakes Dashboard)
                try {
                    const cExamId = window.currentExamId || urlParams.get('examId') || 'امتحان';
                    const cleanSubject = (subjectName || 'مادة').replace(/[.#$\[\]]/g, '');
                    const cleanExam = cExamId.replace(/[.#$\[\]]/g, '');
                    
                    let hash = 0;
                    for (let i = 0; i < q.text.length; i++) hash = Math.imul(31, hash) + q.text.charCodeAt(i) | 0;
                    const qId = 'q_' + Math.abs(hash);

                    const chosenText = q.options[selectedIdx] || 'غير محدد';
                    const correctText = q.options[correctIdx] || 'غير محدد';
                    
                    const qRef = database.ref(`ExamAnalytics/${cleanSubject}/${cleanExam}/${qId}`);
                    
                    qRef.child('questionText').set(q.text);
                    qRef.child('correctAnswer').set(correctText);
                    qRef.child('explanation').set(q.explanation || 'لا يوجد تعليل');
                    
                    qRef.child('totalMistakes').set(firebase.database.ServerValue.increment(1));
                    
                    const safeChosen = chosenText.replace(/[.#$\[\]]/g, '_').substring(0, 50);
                    qRef.child(`choices/${safeChosen}`).set(firebase.database.ServerValue.increment(1));
                } catch(err) {
                    console.error("Analytics Error", err);
                }
            }
            
            // Show feedback
            const feedCard = document.getElementById('feedbackCard');
            feedCard.style.display = 'block';
            feedCard.className = 'feedback-card ' + (isCorrect ? 'correct-card' : 'wrong-card');
            
            let feedHTML = `
                <div class="feedback-status">
                    ${isCorrect ? '✅ <span style="color:#22c55e;">إجابة صحيحة! أنت رائع 🌟</span>' : '❌ <span style="color:#ef4444;">إجابة خاطئة</span>'}
                </div>
            `;
            
            if (!isCorrect && q.options[correctIdx]) {
                feedHTML += `
                    <div class="correct-answer-box">
                        💡 الإجابة الصحيحة: <strong>${q.options[correctIdx]}</strong>
                    </div>
                `;
            }
            
            if (q.explanation) {
                feedHTML += `<div class="explanation-text">${q.explanation.replace(/\*\*(.*?)\*\*/g, '<mark style="background-color: #FBBF24; color: #1A1D2E; padding: 2px 6px; border-radius: 4px; font-weight: bold;">$1</mark>')}</div>`;
            }
            
            feedHTML += `<button class="next-btn" id="nextBtn">${currentIndex < questions.length - 1 ? 'السؤال التالي ⬅️' : '🎉 إنهاء الامتحان'}</button>`;
            feedCard.innerHTML = feedHTML;
            
            document.getElementById('nextBtn').onclick = () => {
                currentIndex++;
                showQuestion();
            };
            
            // Scroll to feedback
            feedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        
        // ─── Finish Quiz ───
        function finishQuiz() {
            clearInterval(timerInterval);
            const autoQuestions = questions.filter(q => q.type !== 'essay').length;
            const total = questions.length;
            const wrong = autoQuestions - correctCount;
            const pct = autoQuestions > 0 ? Math.round((correctCount / autoQuestions) * 100) : 0;
            
            const user = JSON.parse(localStorage.getItem('user'));
            // Removed Firebase PendingGrading submission based on admin request
            
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('quizProgressBar').style.width = '100%';
            
            const resultScreen = document.getElementById('resultScreen');
            resultScreen.style.display = 'block';
            
            if (autoQuestions === 0 && pendingEssays.length > 0) {
                // Only essay questions in exam
                document.getElementById('resultScore').textContent = '📝';
                document.getElementById('resultScore').style.fontSize = '50px';
                document.getElementById('correctCount').textContent = '-';
                document.getElementById('wrongCount').textContent = '-';
                document.getElementById('totalCount').textContent = total;
            } else {
                document.getElementById('resultScore').textContent = pct + '%';
                document.getElementById('correctCount').textContent = correctCount;
                document.getElementById('wrongCount').textContent = wrong;
                document.getElementById('totalCount').textContent = autoQuestions;
            }
            
            let emoji = '🏆', label = 'أداء استثنائي! أنت نجم! 🌟';
            if (pct < 50) { emoji = '💪'; label = 'تذكر: الأخطاء خطوات التعلم! حاول مرة أخرى'; }
            else if (pct < 75) { emoji = '👍'; label = 'جيد! يمكنك تحسين نتيجتك بمراجعة الأخطاء'; }
            else if (pct < 90) { emoji = '🎉'; label = 'ممتاز! استمر في هذا المستوى'; }
            
            if (pendingEssays.length > 0) {
                label = 'تم انتهاء الامتحان! يمكنك الآن مراجعة إجاباتك المقالية أدناه 👇';
                emoji = '📝';
                
                const essayArea = document.getElementById('essayResultsArea');
                essayArea.style.display = 'block';
                
                let essayHTML = `
                    <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-right: 4px solid #3B82F6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <h3 style="color: #1E3A8A; margin-top: 0; margin-bottom: 10px;">📌 تنبيه بخصوص الأسئلة المقالية</h3>
                        <p style="color: #1E40AF; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                            نظراً لصعوبة واستهلاك وقت كبير في تصحيح كل أسئلة المقالي لكل الطلاب يدوياً، قررت إدارة المنصة توفير <b>الإجابة النموذجية</b> فوراً بعد إنهاء الامتحان لتقوم بتقييم إجابتك بنفسك.<br>
                            <div style="display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.6); padding: 15px; border-radius: 12px; border: 1px dashed #93C5FD; margin-top: 15px;">
                                <div style="font-weight: bold; color: #1E3A8A; margin-bottom: 12px;">💡 لو شاكك في إجابتك أو عاوز تتأكد من صحتها، تقدر تبعتها وتراجعها مع المشرفين هنا:</div>
                                <button onclick="window.open('https://chat.whatsapp.com/DkMNxi1wDq3APscsSGBoFn')" style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 800; font-family: inherit; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(37,211,102,0.4);">
                                    <span style="font-size: 20px;">📱</span> الدخول لجروب الواتساب
                                </button>
                            </div>
                        </p>
                    </div>
                `;
                
                pendingEssays.forEach((essay, idx) => {
                    essayHTML += `
                        <div class="card" style="margin-bottom: 15px; padding: 20px; text-align: right; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee;">
                            <div style="font-weight: bold; font-size: 16px; margin-bottom: 15px; color: var(--text-color);">
                                س${idx + 1}: ${essay.text}
                            </div>
                            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #ddd;">
                                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">إجابتك:</div>
                                <div style="font-size: 15px; color: var(--text-color);">${essay.studentAnswer || 'لم تقم بالإجابة'}</div>
                            </div>
                            <div style="background: linear-gradient(to left, #F0FDF4, #DCFCE7); padding: 15px; border-radius: 12px; border: 1px solid #BBF7D0;">
                                <div style="font-size: 12px; color: #166534; margin-bottom: 5px; font-weight: bold;">✅ الإجابة النموذجية:</div>
                                <div style="font-size: 15px; color: #15803D; line-height: 1.6;">
                                    ${(essay.explanation || 'لا يوجد توضيح متاح').replace(/\*\*(.*?)\*\*/g, '<b style="color:#166534; background:rgba(187, 247, 208, 0.5); padding:0 4px; border-radius:4px;">$1</b>')}
                                </div>
                            </div>
                        </div>
                    `;
                });
                essayArea.innerHTML = essayHTML;
            }
            
            document.getElementById('resultEmoji').textContent = emoji;
            document.getElementById('resultLabel').textContent = label;
            
            // Save to Firebase
            if (user && user.studentCode) {
                const statsRef = database.ref('Students/' + user.studentCode + '/stats');
                statsRef.once('value').then(snap => {
                    const stats = snap.val() || { examsTaken: 0, totalScore: 0 };
                    stats.examsTaken = (stats.examsTaken || 0) + 1;
                    stats.totalScore = (stats.totalScore || 0) + pct;
                    stats.averageScore = Math.round(stats.totalScore / stats.examsTaken);
                    stats.lastExam = { subject: subjectName, score: pct, date: Date.now() };
                    statsRef.set(stats);
                    database.ref('Leaderboard/' + user.studentCode).set({
                        fullName: user.fullName,
                        studentCode: user.studentCode,
                        score: stats.totalScore,
                        examsTaken: stats.examsTaken,
                        averageScore: stats.averageScore
                    });
                }).catch(() => {});
            }
        }
        
        // ─── Load Questions ───
        function initQuiz() {
            if (mode === 'mistakes') {
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');
                const subjectFilter = urlParams.get('subject');
                if (subjectFilter) mistakes = mistakes.filter(m => m.subjectName === subjectFilter);
                if (mistakes.length > 0) {
                    questions = mistakes.map(m => ({
                        text: m.text || m.questionText,
                        options: m.options || ['صح ✅', 'خطأ ❌'],
                        correct: m.correct !== undefined ? m.correct : 0,
                        explanation: m.explanation || ''
                    }));
                    startTimer();
                    showQuestion();
                } else {
                    showToast('لا توجد أخطاء مسجلة لهذه المادة!', 'warning');
                    setTimeout(() => location.href = 'mistakes.html', 1500);
                }
                return;
            }
            
            // Try to load by examId if provided
            const examIdParam = urlParams.get('examId');
            if (examIdParam && subjectName && subjectName !== 'امتحان') {
                document.getElementById('questionText').textContent = 'جاري سحب بيانات الامتحان من السيرفر...';
                database.ref('Exams').child(subjectName).child(examIdParam).once('value').then(snap => {
                    if (snap.exists()) {
                        const examData = snap.val();
                        if (examData.jsonCode) {
                            try {
                                const parsed = JSON.parse(examData.jsonCode);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    questions = parsed.map(q => ({
                                        type: q.type || 'mcq',
                                        text: q.text,
                                        options: q.options,
                                        correct: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correct !== undefined ? q.correct : 0),
                                        explanation: q.explanation || ''
                                    }));
                                    startTimer();
                                    showQuestion();
                                } else {
                                    document.getElementById('questionText').textContent = 'خطأ: كود JSON لا يحتوي على أسئلة.';
                                }
                            } catch(e) {
                                console.error('Exam JSON parse error:', e);
                                document.getElementById('questionText').textContent = 'خطأ في تنسيق كود JSON الخاص بالامتحان!';
                            }
                        } else {
                            document.getElementById('questionText').textContent = 'خطأ: الامتحان لا يحتوي على أسئلة (jsonCode مفقود).';
                        }
                    } else {
                        // Fallback: Check if it's an old flat structure exam
                        database.ref('Exams').child(examIdParam).once('value').then(oldSnap => {
                            if (oldSnap.exists() && oldSnap.val().jsonCode) {
                                try {
                                    const parsed = JSON.parse(oldSnap.val().jsonCode);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        questions = parsed.map(q => ({
                                            type: q.type || 'mcq',
                                            text: q.text,
                                            options: q.options,
                                            correct: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correct !== undefined ? q.correct : 0),
                                            explanation: q.explanation || ''
                                        }));
                                        startTimer();
                                        showQuestion();
                                    }
                                } catch(e) {
                                    document.getElementById('questionText').textContent = 'خطأ في تنسيق كود JSON!';
                                }
                            } else {
                                document.getElementById('questionText').textContent = 'عذراً، الامتحان غير موجود في قاعدة البيانات.';
                            }
                        });
                    }
                }).catch(err => {
                    console.error('Failed to load exam:', err);
                    document.getElementById('questionText').textContent = 'فشل في الاتصال بقاعدة البيانات: ' + err.message;
                });
                return;
            }

            // Try to parse from URL param (JSON exam code) - DEPRECATED fallback
            const examJsonStr = urlParams.get('exam');
            if (examJsonStr) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(examJsonStr));
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        questions = parsed.map(q => ({
                            type: q.type || 'mcq',
                            text: q.text,
                            options: q.options,
                            correct: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correct !== undefined ? q.correct : 0),
                            explanation: q.explanation || ''
                        }));
                        startTimer();
                        showQuestion();
                        return;
                    }
                } catch(e) {
                    console.error('Exam JSON parse error:', e);
                }
            }
            
            // Try loading from Firebase directly by subject
            if (subjectName && subjectName !== 'امتحان') {
                database.ref('Exams').child(subjectName).limitToLast(1).once('value').then(snap => {
                    if (snap.exists()) {
                        const examObj = Object.values(snap.val())[0];
                        if (examObj && examObj.jsonCode) {
                            try {
                                const parsed = JSON.parse(examObj.jsonCode);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    questions = parsed.map(q => ({
                                        text: q.text,
                                        options: q.options,
                                        correct: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correct !== undefined ? q.correct : 0),
                                        explanation: q.explanation || ''
                                    }));
                                    startTimer();
                                    showQuestion();
                                    return;
                                }
                            } catch(e) { console.error('Firebase exam parse error:', e); }
                        } else if (examObj && examObj.questions && Array.isArray(examObj.questions)) {
                            questions = examObj.questions;
                            startTimer();
                            showQuestion();
                            return;
                        }
                    }
                    showToast('لم يتم رفع امتحان لهذه المادة بعد 📝', 'warning');
                    setTimeout(() => location.href = 'courses.html', 2000);
                });
            } else {
                showToast('لم يتم رفع امتحان لهذه المادة بعد 📝', 'warning');
                setTimeout(() => location.href = 'courses.html', 2000);
            }
        }
        
        initQuiz();
    
