import re

with open('web_version/quiz.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add window.sessionMistakes
content = content.replace('// ─── State ───\n        let questions = [];', '// ─── State ───\n        window.sessionMistakes = [];\n        let questions = [];')

# 2. Update checkMatchingAnswerGrid
matching_old = '''            } else {
                
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');'''
matching_new = '''            } else {
                window.sessionMistakes.push({
                    questionNumber: currentIndex + 1,
                    text: q.text,
                    correctAnswer: 'التوصيل الصحيح كما ظهر لك في الإجابة',
                    wrongAnswer: 'توصيل خاطئ',
                    explanation: q.explanation || ''
                });
                
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');'''
content = content.replace(matching_old, matching_new)

# 3. Update checkAnswer
mcq_old = '''            } else {
                // Save to mistakes bank
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');'''
mcq_new = '''            } else {
                const chosenText = q.options[selectedIdx] || 'غير محدد';
                const correctText = q.options[correctIdx] || 'غير محدد';
                window.sessionMistakes.push({
                    questionNumber: currentIndex + 1,
                    text: q.text,
                    correctAnswer: correctText,
                    wrongAnswer: chosenText,
                    explanation: q.explanation || ''
                });
                // Save to mistakes bank
                let mistakes = JSON.parse(localStorage.getItem('mistakes_list') || '[]');'''
content = content.replace(mcq_old, mcq_new)

# 4. Insert showDetailedReport and update finishQuiz
# Let's find the start of finishQuiz
report_func = '''
        function showDetailedReport(correctCount, wrongCount, totalAuto) {
            document.getElementById('resultScreen').style.display = 'none';
            
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const studentName = user.fullName || 'طالب';
            const examName = window.currentExamId || urlParams.get('examId') || urlParams.get('subject') || 'امتحان غير محدد';
            const subName = urlParams.get('subject') || 'غير محدد';
            const pct = totalAuto > 0 ? Math.round((correctCount / totalAuto) * 100) : 0;
            
            const reportDiv = document.createElement('div');
            reportDiv.id = 'detailedReportScreen';
            reportDiv.style.cssText = 'max-width: 900px; margin: 40px auto; background: #fffcf2; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); color: #5c3a21; font-family: "Cairo", sans-serif;';
            
            let html = 
                <div style="text-align: center; margin-bottom: 30px; position: relative;">
                    <div style="font-size: 50px; margin-bottom: 10px;">📜</div>
                    <h1 style="font-weight: 900; font-size: 32px; color: #8b4513; margin-bottom: 5px;">تقرير تفصيلي بنتيجة الامتحان</h1>
                    <p style="font-weight: 700; color: #a0522d; margin-bottom: 20px;">منصة العلم الحديثة، تقرير يوثق أداء الطالب</p>
                    <div style="border-top: 2px dashed #deb887; margin: 20px 0;"></div>
                    
                    <div style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 30px; background: linear-gradient(180deg, #fef3c7, #fde68a); box-shadow: 0 4px 15px rgba(245,158,11,0.3);">
                        <div style="font-size: 30px; font-weight: 900; color: #92400e;">\</div>
                        <div style="font-size: 12px; font-weight: 700; color: #b45309;">النتيجة النهائية</div>
                    </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; background: #faebd7; padding: 20px; border-radius: 12px; font-weight: 700; margin-bottom: 40px; border: 1px solid #e6ccb2;">
                    <div style="flex: 1 1 50%; margin-bottom: 15px;">الطالب: <span style="color:#8b4513;">\</span></div>
                    <div style="flex: 1 1 50%; margin-bottom: 15px;">المادة: <span style="color:#8b4513;">\</span></div>
                    <div style="flex: 1 1 50%;">الامتحان: <span style="color:#8b4513;">\</span></div>
                    <div style="flex: 1 1 50%;">الإجابات الصحيحة: <span style="color:#16a34a;">\ / \</span></div>
                    <div style="flex: 1 1 50%; margin-top: 15px; color: #dc2626;">الأخطاء: \</div>
                </div>
            ;

            if (window.sessionMistakes && window.sessionMistakes.length > 0) {
                html += 
                    <div style="border-bottom: 3px solid #deb887; margin-bottom: 25px;">
                        <h2 style="color: #8b4513; font-weight: 900; display: inline-block; border-bottom: 3px solid #8b4513; padding-bottom: 5px; margin-bottom: -3px;">سجل الأخطاء والتصويبات</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 30px;">
                ;
                
                window.sessionMistakes.forEach((m) => {
                    html += 
                        <div style="background: #fff; border: 1px solid #e6ccb2; border-radius: 16px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                            <div style="background: #fef3c7; color: #b45309; display: inline-block; padding: 4px 12px; border-radius: 8px; font-weight: 900; font-size: 14px; margin-bottom: 15px;">
                                سؤال \
                            </div>
                            <div style="font-size: 18px; font-weight: 800; color: #3e2723; margin-bottom: 20px; line-height: 1.6;">
                                \
                            </div>
                            
                            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                                <div style="flex: 1; background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 15px; display: flex; flex-direction: column;">
                                    <div style="color: #16a34a; font-weight: 900; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                                        <span>الإجابة المعتمدة</span>
                                        <span>✅</span>
                                    </div>
                                    <div style="color: #15803d; font-weight: 700;">\</div>
                                </div>
                                <div style="flex: 1; background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 15px; display: flex; flex-direction: column;">
                                    <div style="color: #dc2626; font-weight: 900; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                                        <span>الإجابة المرفوضة</span>
                                        <span>❌</span>
                                    </div>
                                    <div style="color: #b91c1c; font-weight: 700;">\</div>
                                </div>
                            </div>
                    ;
                    if (m.explanation) {
                        html += 
                            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 15px; display: flex; gap: 10px; align-items: flex-start;">
                                <span style="font-size: 18px;">💡</span>
                                <div style="color: #92400e; font-size: 14px; font-weight: 700; line-height: 1.5;">
                                    <span style="font-weight: 900;">حكمة ديوان العلم:</span> \
                                </div>
                            </div>
                        ;
                    }
                    html += </div>;
                });
                
                html += </div>;
            } else if (totalAuto > 0) {
                html += <div style="text-align: center; padding: 40px; font-size: 20px; font-weight: 800; color: #16a34a;">لا توجد أخطاء! أحسنت 🌟</div>;
            }

            if (pendingEssays.length > 0) {
                html += 
                    <div style="border-bottom: 3px solid #deb887; margin-bottom: 25px; margin-top: 40px;">
                        <h2 style="color: #8b4513; font-weight: 900; display: inline-block; border-bottom: 3px solid #8b4513; padding-bottom: 5px; margin-bottom: -3px;">الأسئلة المقالية</h2>
                    </div>
                    <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-right: 4px solid #3B82F6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <h3 style="color: #1E3A8A; margin-top: 0; margin-bottom: 10px;">📌 تنبيه بخصوص التصحيح</h3>
                        <p style="color: #1E40AF; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                            نوفر لك الإجابة النموذجية فوراً لتقيم نفسك. إذا أردت التأكد من إجابتك تواصل مع المشرفين:
                            <button onclick="window.open('https://chat.whatsapp.com/DkMNxi1wDq3APscsSGBoFn')" style="background: #25D366; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-family: inherit; margin-top: 10px; cursor: pointer;">الدخول لجروب الواتساب</button>
                        </p>
                    </div>
                ;
                
                pendingEssays.forEach((essay, idx) => {
                    html += 
                        <div style="background: #fff; border: 1px solid #e6ccb2; border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                            <div style="font-size: 18px; font-weight: 800; color: #3e2723; margin-bottom: 15px;">\</div>
                            <div style="margin-bottom: 15px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <div style="color: #475569; font-weight: 900; margin-bottom: 5px;">✍️ إجابتك:</div>
                                <div style="color: #1e293b; white-space: pre-wrap;">\</div>
                            </div>
                            <div style="padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                                <div style="color: #166534; font-weight: 900; margin-bottom: 5px;">✅ الإجابة النموذجية:</div>
                                <div style="color: #15803d;">\</div>
                            </div>
                        </div>
                    ;
                });
            }
            
            html += 
                <div style="text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <button onclick="location.href='home.html'" style="background: linear-gradient(135deg, #8b4513, #d2691e); color: white; border: none; padding: 15px 30px; border-radius: 12px; font-size: 18px; font-weight: 900; font-family: inherit; cursor: pointer; box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);">
                        🏠 العودة للرئيسية
                    </button>
                    <button onclick="location.href='mistakes.html'" style="background: #fff; color: #8b4513; border: 2px solid #8b4513; padding: 15px 30px; border-radius: 12px; font-size: 18px; font-weight: 900; font-family: inherit; cursor: pointer;">
                        ⚠️ سجل التعلم (جميع الأخطاء)
                    </button>
                </div>
            ;
            
            reportDiv.innerHTML = html;
            document.body.appendChild(reportDiv);
        }
'''

content = content.replace('// ─── Finish Quiz ───', report_func + '\n        // ─── Finish Quiz ───')

# 5. Overwrite the rest of finishQuiz
old_finish_tail = '''            const resultScreen = document.getElementById('resultScreen');
            resultScreen.style.display = 'block';'''
            
# We need to replace everything from "const resultScreen =" to "document.getElementById('resultLabel').textContent = label;"
# Let's use regex
import re
pattern = r"const resultScreen = document\.getElementById\('resultScreen'\);.*?document\.getElementById\('resultLabel'\)\.textContent = label;"
new_tail = '''// Replace standard result screen with detailed report
            showDetailedReport(correctCount, wrong, autoQuestions);'''
content = re.sub(pattern, new_tail, content, flags=re.DOTALL)

with open('web_version/quiz.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
