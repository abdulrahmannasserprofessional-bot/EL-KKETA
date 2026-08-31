
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }
    

        // Load mistakes from localStorage (same as Android app logic)
        const mistakes = JSON.parse(localStorage.getItem('mistakes_list') || "[]");
        const container = document.getElementById('mistakesList');

        function retryMistakes() {
            window.location.href = "quiz.html?mode=mistakes";
        }

        if (mistakes.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 50px; color:#BCBCBC;">سجلك نظيف! لا توجد أخطاء حالياً 🌟</div>`;
            document.getElementById('mainStat').innerText = "سجلك نظيف! أحسنت 🌟";
        } else {
            // Group by subject
            const grouped = mistakes.reduce((acc, m) => {
                acc[m.subjectName] = acc[m.subjectName] || [];
                acc[m.subjectName].push(m);
                return acc;
            }, {});

            for (const subject in grouped) {
                const header = document.createElement('div');
                header.className = 'subject-header';
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
                header.style.padding = '20px 20px 5px';
                header.innerHTML = `
                    <span>${subject}</span>
                    <button class="btn-primary" style="width: auto; padding: 6px 15px; font-size: 12px; border-radius: 10px;" onclick="location.href='quiz.html?mode=mistakes&subject=${encodeURIComponent(subject)}'">إعادة محاولة المادة 🔄</button>
                `;
                container.appendChild(header);

                grouped[subject].forEach(m => {
                    const card = document.createElement('div');
                    card.className = 'card mistake-card';
                    card.innerHTML = `
                        <div style="font-weight: bold; font-size: 16px;">${m.questionText}</div>
                        <div class="explanation">
                            <b>التصويب:</b> ${m.explanation.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}
                        </div>
                    `;
                    container.appendChild(card);
                });
            }

            // Update stats
            const totalErrors = mistakes.length;
            const mostSubject = Object.entries(grouped).sort((a,b) => b[1].length - a[1].length)[0];
            
            document.getElementById('mainStat').innerText = `إجمالي الأخطاء: ${totalErrors} | الأكثر احتياجاً للتركيز: ${mostSubject[0]}`;
            
            let breakdown = "نسب توزيع الأخطاء: ";
            for (const subject in grouped) {
                const pct = Math.round((grouped[subject].length / totalErrors) * 100);
                breakdown += `${subject} (${pct}%) | `;
            }
            if (breakdown.endsWith(" | ")) breakdown = breakdown.slice(0, -3);
            
            document.getElementById('subStat').innerText = breakdown;
            document.getElementById('retryBtn').style.display = "block";
        }
    