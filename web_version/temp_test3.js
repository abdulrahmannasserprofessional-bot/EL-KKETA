
        // Load mistakes from localStorage (same as Android app logic)
        const mistakes = JSON.parse(localStorage.getItem('mistakes_list') || "[]");
        const container = document.getElementById('mistakesList');
        const subjectSelect = document.getElementById('filterSubject');
        const examSelect = document.getElementById('filterExam');

        function retryMistakes() {
            window.location.href = "quiz.html?mode=mistakes";
        }

        if (mistakes.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 50px; color:#BCBCBC;">سجلك نظيف! لا توجد أخطاء حالياً 🌟</div>`;
            document.getElementById('mainStat').innerText = "سجلك نظيف! أحسنت 🌟";
        } else {
            document.getElementById('filterCard').style.display = 'block';

            // Group by subject and then by exam
            const groupedBySub = {};
            const examsBySub = {};

            mistakes.forEach(m => {
                const sub = m.subjectName || 'مادة غير محددة';
                const exm = m.examId || 'امتحان غير محدد';
                
                groupedBySub[sub] = groupedBySub[sub] || [];
                groupedBySub[sub].push(m);

                examsBySub[sub] = examsBySub[sub] || new Set();
                examsBySub[sub].add(exm);
            });

            // Populate subjects
            for (const sub in groupedBySub) {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                subjectSelect.appendChild(opt);
            }

            window.updateExamFilter = function() {
                const selectedSub = subjectSelect.value;
                examSelect.innerHTML = '<option value="">كل الامتحانات</option>';
                
                if (selectedSub && examsBySub[selectedSub]) {
                    examsBySub[selectedSub].forEach(exm => {
                        const opt = document.createElement('option');
                        opt.value = exm;
                        opt.textContent = exm;
                        examSelect.appendChild(opt);
                    });
                }
                renderMistakes();
            }

            window.renderMistakes = function() {
                container.innerHTML = '';
                const selectedSub = subjectSelect.value;
                const selectedExam = examSelect.value;

                let filteredMistakes = mistakes;
                if (selectedSub) {
                    filteredMistakes = filteredMistakes.filter(m => (m.subjectName || 'مادة غير محددة') === selectedSub);
                }
                if (selectedExam) {
                    filteredMistakes = filteredMistakes.filter(m => (m.examId || 'امتحان غير محدد') === selectedExam);
                }

                if (filteredMistakes.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding: 50px; color:#BCBCBC;">لا توجد أخطاء مطابقة للبحث 🌟</div>`;
                    return;
                }

                // Group filtered by subject to render correctly
                const renderGrouped = {};
                filteredMistakes.forEach(m => {
                    const sub = m.subjectName || 'مادة غير محددة';
                    renderGrouped[sub] = renderGrouped[sub] || [];
                    renderGrouped[sub].push(m);
                });

                for (const subject in renderGrouped) {
                    const header = document.createElement('div');
                    header.className = 'subject-header';
                    header.style.display = 'flex';
                    header.style.justifyContent = 'space-between';
                    header.style.alignItems = 'center';
                    header.style.padding = '20px 20px 5px';
                    
                    let retryUrl = `quiz.html?mode=mistakes&subject=${encodeURIComponent(subject)}`;
                    if (selectedExam) {
                        // We could pass exam to retry, but currently mistakes mode filters by subject
                        // We just pass it anyway
                    }

                    header.innerHTML = `
                        <span>${subject} ${selectedExam ? ' - ' + selectedExam : ''}</span>
                        <button class="btn-primary" style="width: auto; padding: 6px 15px; font-size: 12px; border-radius: 10px;" onclick="location.href='${retryUrl}'">إعادة محاولة الأخطاء 🔄</button>
                    `;
                    container.appendChild(header);

                    renderGrouped[subject].forEach(m => {
                        const card = document.createElement('div');
                        card.className = 'card mistake-card';
                        
                        let hash = 0;
                        const text = m.questionText || '';
                        for (let i = 0; i < text.length; i++) hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
                        const qId = 'q_' + Math.abs(hash);
                        const cleanSubject = (m.subjectName || 'مادة').replace(/[.#$\[\]]/g, '');
                        const cleanExam = (m.examId || 'امتحان').replace(/[.#$\[\]]/g, '');

                        const uniqueCardId = 'card_' + qId + '_' + Date.now() + Math.floor(Math.random()*1000);
                        card.id = uniqueCardId;

                        card.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <span class="exam-badge" style="background: linear-gradient(135deg, #E0E7FF, #C7D2FE); color: #3730A3; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">
                                    📝 ${m.examId || 'امتحان غير محدد'}
                                </span>
                            </div>
                            <div style="font-weight: bold; font-size: 16px; color: var(--text-color); line-height: 1.6; margin-bottom: 15px;">
                                ${m.questionText}
                            </div>
                            <div class="explanation success-box" style="background: linear-gradient(to left, #F0FDF4, #DCFCE7); border-color: #BBF7D0; color: #166534; margin-bottom: 15px;">
                                <b style="color: #15803D; font-size: 15px;">✅ الإجابة النموذجية:</b><br>
                                <span style="display: inline-block; margin-top: 6px; line-height: 1.6;">
                                ${(m.explanation || 'لا يوجد توضيح متاح لهذه الإجابة').replace(/\*\*(.*?)\*\*/g, '<b style="color:#166534; background:rgba(187, 247, 208, 0.5); padding:0 4px; border-radius:4px;">$1</b>')}
                                </span>
                            </div>
                            <div class="analytics-box" id="analytics_${uniqueCardId}" style="background: rgba(0,0,0,0.03); border: 1px dashed var(--border-color); border-radius: 12px; padding: 15px; font-size: 13px; color: var(--text-sub);">
                                جاري تحميل إحصائيات زملائك... ⏳
                            </div>
                        `;
                        container.appendChild(card);

                        // Fetch Analytics
                        database.ref(`ExamAnalytics/${cleanSubject}/${cleanExam}/${qId}`).once('value').then(snap => {
                            const aBox = document.getElementById(`analytics_${uniqueCardId}`);
                            if (!aBox) return;
                            
                            if (snap.exists()) {
                                const data = snap.val();
                                const totalMistakes = data.totalMistakes || 0;
                                let statsHtml = `<div style="font-weight: bold; color: #EF4444; margin-bottom: 8px;">📊 أخطأ في هذا السؤال ${totalMistakes} طالب</div>`;
                                
                                if (data.choices) {
                                    statsHtml += `<div style="font-size: 12px; margin-bottom: 5px;">إجابات الطلاب الخاطئة:</div>`;
                                    statsHtml += `<div style="display: flex; flex-direction: column; gap: 5px;">`;
                                    
                                    // Sort choices by frequency
                                    const choicesArr = Object.entries(data.choices).sort((a, b) => b[1] - a[1]);
                                    
                                    choicesArr.forEach(c => {
                                        const choiceText = c[0].replace(/_/g, ' '); // simple unescape
                                        const count = c[1];
                                        const pct = Math.round((count / totalMistakes) * 100) || 0;
                                        
                                        statsHtml += `
                                            <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 6px 10px; border-radius: 6px; border: 1px solid #eee;">
                                                <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 10px;">${choiceText}</span>
                                                <span style="font-weight: bold; color: #64748b;">${pct}% (${count})</span>
                                            </div>
                                        `;
                                    });
                                    statsHtml += `</div>`;
                                }
                                aBox.innerHTML = statsHtml;
                            } else {
                                aBox.innerHTML = `🌟 أنت من أوائل من أخطأ في هذا السؤال! لا توجد إحصائيات كافية بعد.`;
                            }
                        }).catch(e => {
                            const aBox = document.getElementById(`analytics_${uniqueCardId}`);
                            if(aBox) aBox.style.display = 'none';
                        });
                    });
                }
            };

            // Update stats
            const totalErrors = mistakes.length;
            const mostSubject = Object.entries(groupedBySub).sort((a,b) => b[1].length - a[1].length)[0];
            
            document.getElementById('mainStat').innerText = `إجمالي الأخطاء: ${totalErrors} | الأكثر احتياجاً للتركيز: ${mostSubject ? mostSubject[0] : '-'}`;
            
            let breakdown = "نسب توزيع الأخطاء: ";
            for (const subject in groupedBySub) {
                const pct = Math.round((groupedBySub[subject].length / totalErrors) * 100);
                breakdown += `${subject} (${pct}%) | `;
            }
            if (breakdown.endsWith(" | ")) breakdown = breakdown.slice(0, -3);
            
            document.getElementById('subStat').innerText = breakdown;
            document.getElementById('retryBtn').style.display = "block";

            // Initial render
            renderMistakes();
        }
    
