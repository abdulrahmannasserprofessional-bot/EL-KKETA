
        let generatedOTP = "";
        let pendingUserData = {};
        function showToast(message, type = "info") {
            const toast = document.getElementById("toast");
            toast.innerHTML = message;
            if (type === 'success') toast.style.borderBottomColor = '#00B894';
            else if (type === 'error') toast.style.borderBottomColor = '#D63031';
            else if (type === 'warning') toast.style.borderBottomColor = '#FDCB6E';
            else toast.style.borderBottomColor = '#6c5ce7';
            toast.className = "show";
            setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const preCode = urlParams.get('code');

        function moveToNext(current, event) {
            if (event.key === 'Backspace') {
                if (current.previousElementSibling) current.previousElementSibling.focus();
            } else if (current.value.length === 1) {
                if (current.nextElementSibling) current.nextElementSibling.focus();
            }
        }

        function startTimer(durationInSeconds) {
            const resendBtn = document.querySelector('.resend-link');
            resendBtn.style.pointerEvents = 'none';
            resendBtn.style.color = '#b2bec3';
            
            let timer = durationInSeconds;
            clearInterval(window.timerInterval);
            
            window.timerInterval = setInterval(function () {
                let minutes = parseInt(timer / 60, 10);
                let seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                resendBtn.textContent = "يمكنك إعادة الإرسال بعد " + minutes + ":" + seconds + " ⏳";

                if (--timer < 0) {
                    clearInterval(window.timerInterval);
                    resendBtn.style.pointerEvents = 'all';
                    resendBtn.style.color = '#6c5ce7';
                    resendBtn.textContent = "إعادة إرسال الكود مرة أخرى 🔄";
                }
            }, 1000);
        }

        function sendOTP() {
            if (!pendingUserData.email) return;
            
            generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
            const btn = document.querySelector('.register-card button');
            
            // NOTE: Emergency code logic handled by admin-otps.html (generator)


            // Call Vercel Serverless Function
            fetch('https://localhost/disabled-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: pendingUserData.email,
                    name: pendingUserData.fullName,
                    code: generatedOTP
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast("تم إرسال كود التحقق بنجاح ✉️", "success");
                    startTimer(150); // 150 seconds (2.5 mins) countdown
                } else {
                    throw new Error("Failed to send");
                }
            })
            .catch(err => {
                console.error(err);
                showToast("تعذر إرسال الإيميل. إذا حصلت على كود طوارئ من الإدارة، أدخله الآن.", "warning");
                // DO NOT close modal so they can enter emergency code
                btn.textContent = "إعادة محاولة 🚀";
                btn.style.opacity = "1";
            });
        }

        async function verifyOTP() {
            const inputs = document.querySelectorAll('.otp-digit');
            let enteredOTP = '';
            inputs.forEach(input => enteredOTP += input.value);
            
            const btn = document.querySelector('.verify-btn');
            btn.textContent = "جاري التحقق...";

            let isValid = false;

            // 1. Check generatedOTP (if mail arrived)
            if (enteredOTP === generatedOTP && enteredOTP.length === 4) {
                isValid = true;
            } 
            // 2. Check Admin Emergency Codes (if mail failed)
            else if (enteredOTP.length === 4) {
                try {
                    const snap = await database.ref('EmergencyCodes/' + enteredOTP).once('value');
                    if (snap.exists() && snap.val().active) {
                        const codeAge = Date.now() - snap.val().timestamp;
                        if (codeAge < 60 * 60 * 1000) { // 1 hour validity
                            isValid = true;
                            await database.ref('EmergencyCodes/' + enteredOTP).update({
                                active: false,
                                usedBy: pendingUserData.whatsapp,
                                usedAt: Date.now()
                            });
                        } else {
                            showToast("هذا الكود منتهي الصلاحية ⚠️", "error");
                        }
                    }
                } catch(e) {
                    console.error("Firebase emergency code check failed", e);
                }
            }
            
            if (isValid) {
                // Correct OTP -> Save to Firebase
                btn.textContent = "جاري الحفظ...";
                
                database.ref('Students/' + pendingUserData.studentCode).set(pendingUserData).then(() => {
                    if (preCode) {
                        database.ref('ActivationCodes/' + preCode).update({
                            isUsed: true, usedBy: pendingUserData.fullName, phone: pendingUserData.whatsapp, activatedAt: Date.now()
                        });
                    }
                    localStorage.setItem('user', JSON.stringify(pendingUserData));
                    
                    showToast("تم إنشاء الحساب وتأكيد الإيميل بنجاح 🎉", "success");
                    setTimeout(() => location.href = "display-code.html", 1500);
                }).catch(() => {
                    showToast("حدث خطأ أثناء حفظ البيانات ", "error");
                    btn.textContent = "تأكيد الكود ✔️";
                });
            } else {
                showToast("الكود غير صحيح، يرجى المحاولة مرة أخرى ⚠️", "error");
                btn.textContent = "تأكيد الكود ✔️";
            }
        }

        function register() {
            const name = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('whatsapp').value.trim();
            const email = document.getElementById('email').value.trim() || "student@elkheta.com";
            const privacyChecked = document.getElementById('privacyCheck').checked;

            if (!name || phone.length < 10) {
                showToast("يرجى إدخال الاسم ورقم الواتساب بشكل صحيح ⚠️", "warning");
                return;
            }
            
            if (!privacyChecked) {
                showToast("يجب الموافقة على سياسة الخصوصية والشروط أولاً ⚠️", "error");
                return;
            }

            const btn = document.querySelector('.register-card button');
            btn.textContent = "جاري إنشاء الحساب...";
            btn.disabled = true;
            btn.style.opacity = "0.75";

            const studentCode = preCode || generateCode(name, phone);
            const userData = { 
                fullName: name, 
                whatsapp: phone, 
                email: email, 
                studentCode: studentCode, 
                joinDate: Date.now() 
            };

            database.ref('Students/' + studentCode).set(userData).then(() => {
                if (preCode) {
                    database.ref('ActivationCodes/' + preCode).update({
                        isUsed: true, 
                        usedBy: name, 
                        phone: phone, 
                        activatedAt: Date.now()
                    });
                }
                localStorage.setItem('user', JSON.stringify(userData));
                
                showToast("تم إنشاء الحساب بنجاح 🎉", "success");
                setTimeout(() => location.href = "display-code.html", 1000);
            }).catch((err) => {
                console.error(err);
                showToast("حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً ⚠️", "error");
                btn.textContent = "إنشاء الحساب الآن 🚀";
                btn.disabled = false;
                btn.style.opacity = "1";
            });
        }

        function generateCode(name, phone) {
            const map = {"أ":"A","إ":"E","آ":"A","ا":"A","ب":"B","ت":"T","ث":"T","ج":"J","ح":"H","خ":"K","د":"D","ذ":"D","ر":"R","ز":"Z","س":"S","ش":"S","ص":"S","ض":"D","ط":"T","ظ":"Z","ع":"A","غ":"G","ف":"F","ق":"Q","ك":"K","ل":"L","م":"M","ن":"N","ه":"H","و":"W","ي":"Y","ؤ":"O","ئ":"E"};
            let firstChar = name.charAt(0).toUpperCase();
            let ch = map[firstChar] || (/[A-Z]/.test(firstChar) ? firstChar : "S");
            return ch.toUpperCase() + phone.slice(-4).padStart(4, '0');
        }
    