
        function generateCode() {
            // Generate a random 4 digit code
            const code = Math.floor(1000 + Math.random() * 9000).toString();
            database.ref('EmergencyCodes').child(code).set({
                active: true,
                timestamp: Date.now()
            }).then(() => {
                // Done
            }).catch(e => alert("حدث خطأ أثناء التوليد"));
        }

        database.ref('EmergencyCodes').on('value', snap => {
            const list = document.getElementById('otpList');
            list.innerHTML = "";
            let hasData = false;
            
            if (snap.exists()) {
                const now = Date.now();
                snap.forEach(child => {
                    const data = child.val();
                    const code = child.key;
                    
                    if (data.active) {
                        hasData = true;
                        const date = new Date(data.timestamp).toLocaleString('ar-EG');
                        list.innerHTML += `
                            <div class="otp-card">
                                <div class="otp-info">
                                    <strong>كود متاح للاستخدام</strong>
                                    <span>🕒 تم التوليد: ${date}</span>
                                </div>
                                <div class="otp-code">${code}</div>
                            </div>
                        `;
                    }
                });
            }
            
            if (!hasData) {
                list.innerHTML = `<div class="empty-state">✅ لا توجد أكواد طوارئ فعالة حالياً</div>`;
            }
        });
    
