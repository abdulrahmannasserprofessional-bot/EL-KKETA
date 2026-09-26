/**
 * 💬 ELKHETA LIVE CHAT & SUPPORT ENGINE (PRO 2027)
 * Realtime Student-Admin Direct Helpdesk & Communication System
 */

(function () {
    'use strict';

    // 1. Check logged-in student
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch(e) {}

    // Only activate for registered/authenticated students
    if (!user || !user.studentCode) {
        return;
    }

    const studentCode = String(user.studentCode).trim();
    const studentName = user.fullName || user.name || 'طالب';
    const studentPhone = user.phone || '';

    // Wait until Firebase database is ready
    function getDatabase() {
        return window.database || (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
    }

    // 2. Inject CSS & ExamRetakeGuard if not loaded
    if (!document.querySelector('link[href*="live-chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'live-chat.css?v=2.0';
        document.head.appendChild(link);
    }
    if (!window.ExamRetakeGuard && !document.querySelector('script[src*="exam-retake-guard.js"]')) {
        const scr = document.createElement('script');
        scr.src = 'exam-retake-guard.js?v=2.0.0';
        document.head.appendChild(scr);
    }

    // 3. Build UI Elements
    let isDrawerOpen = false;
    let selectedImageBase64 = null;
    let selectedTag = 'استفسار عام';

    function initChatWidget() {
        if (document.getElementById('liveChatFloatBtn')) return;

        // Floating Action Button
        const floatBtn = document.createElement('div');
        floatBtn.id = 'liveChatFloatBtn';
        floatBtn.className = 'live-chat-float-btn';
        floatBtn.innerHTML = `
            <div class="chat-icon-wrap">
                <i class="fa-solid fa-comments"></i>
                <span class="admin-status-dot" id="chatAdminStatusDot" title="حالة تواجد الإدارة"></span>
            </div>
            <span>تواصل مع الإدارة</span>
            <span class="unread-chat-badge" id="chatUnreadCountBadge" style="display:none;">0</span>
        `;
        document.body.appendChild(floatBtn);

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'liveChatBackdrop';
        backdrop.className = 'live-chat-backdrop';
        document.body.appendChild(backdrop);

        // Drawer
        const drawer = document.createElement('div');
        drawer.id = 'liveChatDrawer';
        drawer.className = 'live-chat-drawer';
        drawer.innerHTML = `
            <!-- Header -->
            <div class="live-chat-header">
                <div class="live-chat-header-info">
                    <div class="live-chat-avatar">👑</div>
                    <div class="live-chat-titles">
                        <h3>فريق إدارة منصة الخطة</h3>
                        <div class="admin-status-text" id="chatAdminStatusText">
                            <i class="fa-solid fa-circle" style="font-size:8px; color:#34D399;"></i>
                            <span>متاحون للرد اللحظي 🟢</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <a href="chat.html" class="live-chat-expand-btn" title="تكبير للشاشة الكاملة" style="color:rgba(255,255,255,0.85); text-decoration:none; width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.14); display:inline-flex; align-items:center; justify-content:center; font-size:12px; transition:all 0.2s;">
                        <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                    </a>
                    <button class="live-chat-close-btn" id="chatCloseBtn">✕</button>
                </div>
            </div>

            <!-- Active Ticket Info Bar -->
            <div class="live-chat-ticket-bar" id="chatTicketBar">
                <span>تذكرة الدعم: <b id="chatTicketIdText">#${studentCode}</b></span>
                <span class="live-chat-ticket-tag" id="chatTicketStatusTag">مفتوحة 💬</span>
            </div>

            <!-- Quick Topic Pills -->
            <div class="live-chat-quick-tags">
                <span class="quick-topic-chip" id="retakeAuthChip" data-action="retake_auth" style="background:rgba(16,185,129,0.14); border-color:rgba(16,185,129,0.4); color:#059669; font-weight:800; cursor:pointer;" title="إعادة فتح الاختبار تلقائياً عبر الدعم الأكاديمي (بدون كود)">⚡ فتح الاختبار مجدداً (بدون كود)</span>
                <span class="quick-topic-chip active" data-topic="استفسار عام">💬 استفسار عام</span>
                <span class="quick-topic-chip" data-topic="امتحان وبابل شيت">📝 امتحان وبابل شيت</span>
                <span class="quick-topic-chip" data-topic="فيديو المحاضرة">🎥 فيديو ومحاضرة</span>
                <span class="quick-topic-chip" data-topic="كود تفعيل">🔑 كود التفعيل</span>
                <span class="quick-topic-chip" data-topic="ملخص PDF">📄 ملخص PDF</span>
                <span class="quick-topic-chip" data-topic="مشكلة تقنية">⚠️ عطل تقني</span>
            </div>

            <!-- Messages Area -->
            <div class="live-chat-messages" id="liveChatMessagesList">
                <div style="text-align:center; padding:30px 15px; color:#94A3B8; font-size:13px; font-weight:600;">
                    أهلاً بك يا <b>${studentName}</b>! 👋<br>
                    اكتب سؤالك أو مشكلتك وسيرد عليك مشرف الإدارة فوراً.
                </div>
            </div>

            <!-- Attachment Preview -->
            <div class="chat-attachment-preview" id="chatAttachmentPreview">
                <img id="chatPreviewImg" src="" alt="preview">
                <button class="remove-img-btn" id="chatRemoveImgBtn">✕</button>
            </div>

            <!-- Input Area -->
            <div class="live-chat-input-box">
                <input type="file" id="chatImageInput" accept="image/*" style="display:none;">
                <button type="button" class="live-chat-tool-btn" id="chatAttachBtn" title="إرفاق صورة مسألة أو مشكلة">
                    <i class="fa-solid fa-camera"></i>
                </button>
                <input type="text" id="chatTextInput" placeholder="اكتب رسالتك للإدارة هنا..." autocomplete="off">
                <button type="button" class="live-chat-send-btn" id="chatSendBtn" title="إرسال الرسالة">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(drawer);

        // Bind events
        floatBtn.addEventListener('click', toggleDrawer);
        backdrop.addEventListener('click', closeDrawer);
        document.getElementById('chatCloseBtn').addEventListener('click', closeDrawer);

        // Topic chips
        const chips = drawer.querySelectorAll('.quick-topic-chip');
        chips.forEach(c => {
            c.addEventListener('click', () => {
                chips.forEach(x => x.classList.remove('active'));
                c.classList.add('active');
                selectedTag = c.dataset.topic;
                const input = document.getElementById('chatTextInput');
                if (input && !input.value.trim()) {
                    input.placeholder = `اكتب بخصوص (${selectedTag})...`;
                    input.focus();
                }
            });
        });

        const retakeBtn = drawer.querySelector('#retakeAuthChip');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.ExamRetakeGuard) {
                    ExamRetakeGuard.openAcademicSupportBot();
                } else {
                    const scr = document.createElement('script');
                    scr.src = 'exam-retake-guard.js?v=2.0.0';
                    scr.onload = () => {
                        if (window.ExamRetakeGuard) ExamRetakeGuard.openAcademicSupportBot();
                    };
                    document.head.appendChild(scr);
                }
            });
        }

        // Send actions
        const sendBtn = document.getElementById('chatSendBtn');
        const textInput = document.getElementById('chatTextInput');
        sendBtn.addEventListener('click', sendStudentMessage);
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendStudentMessage();
            }
        });

        // Image attach
        const attachBtn = document.getElementById('chatAttachBtn');
        const fileInput = document.getElementById('chatImageInput');
        const removeImgBtn = document.getElementById('chatRemoveImgBtn');

        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Compress image to reasonable base64
            const reader = new FileReader();
            reader.onload = function (ev) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const maxDim = 900;
                    let w = img.width;
                    let h = img.height;
                    if (w > h && w > maxDim) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else if (h > maxDim) {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.82);

                    document.getElementById('chatPreviewImg').src = selectedImageBase64;
                    document.getElementById('chatAttachmentPreview').style.display = 'block';
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });

        removeImgBtn.addEventListener('click', () => {
            selectedImageBase64 = null;
            document.getElementById('chatAttachmentPreview').style.display = 'none';
            document.getElementById('chatPreviewImg').src = '';
            fileInput.value = '';
        });

        // Initialize Firebase listeners
        setupRealtimeListeners();
    }

    function toggleDrawer() {
        if (isDrawerOpen) closeDrawer();
        else openDrawer();
    }

    function openDrawer() {
        isDrawerOpen = true;
        document.getElementById('liveChatDrawer').classList.add('active');
        document.getElementById('liveChatBackdrop').classList.add('active');
        document.getElementById('chatTextInput').focus();

        // Mark student messages as read in DB
        const db = getDatabase();
        if (db) {
            db.ref(`DirectChats/${studentCode}/meta`).update({
                unreadForStudent: 0
            }).catch(() => {});
        }
        document.getElementById('chatUnreadCountBadge').style.display = 'none';
        scrollToBottom();
    }

    function closeDrawer() {
        isDrawerOpen = false;
        document.getElementById('liveChatDrawer').classList.remove('active');
        document.getElementById('liveChatBackdrop').classList.remove('active');
    }

    function scrollToBottom() {
        const list = document.getElementById('liveChatMessagesList');
        if (list) {
            list.scrollTop = list.scrollHeight;
        }
    }

    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    // 4. Send Message Function
    function sendStudentMessage() {
        const textInput = document.getElementById('chatTextInput');
        const text = textInput.value.trim();
        const img = selectedImageBase64;

        if (!text && !img) return;

        const db = getDatabase();
        if (!db) {
            alert('تعذر الاتصال بالسيرفر، يرجى إعادة المحاولة.');
            return;
        }

        const msgRef = db.ref(`DirectChats/${studentCode}/messages`).push();
        const now = Date.now();

        const msgObj = {
            id: msgRef.key,
            sender: 'student',
            senderName: studentName,
            senderCode: studentCode,
            text: text || '',
            imageUrl: img || null,
            topic: selectedTag || 'عام',
            timestamp: now,
            status: 'sent'
        };

        // Clear input immediately for smooth UX
        textInput.value = '';
        selectedImageBase64 = null;
        document.getElementById('chatAttachmentPreview').style.display = 'none';
        document.getElementById('chatPreviewImg').src = '';
        const fileInput = document.getElementById('chatImageInput');
        if (fileInput) fileInput.value = '';

        msgRef.set(msgObj).then(() => {
            // Update Meta & Ticket status
            db.ref(`DirectChats/${studentCode}/meta`).transaction((current) => {
                const prev = current || {};
                return {
                    ...prev,
                    studentCode: studentCode,
                    studentName: studentName,
                    studentPhone: studentPhone,
                    lastMessage: text || '📷 صورة مرفقة',
                    lastTimestamp: now,
                    status: 'open',
                    topic: selectedTag || prev.topic || 'عام',
                    unreadForAdmin: (prev.unreadForAdmin || 0) + 1,
                    unreadForStudent: 0
                };
            });

            // 🤖 رد تلقائي ترحيبي فوري للطالب من فريق دعم المنصة
            db.ref(`DirectChats/${studentCode}/meta/lastAutoReply`).once('value', (arSnap) => {
                const lastAr = arSnap.val() || 0;
                if (!lastAr || (now - lastAr > 15 * 60 * 1000)) {
                    setTimeout(() => {
                        const autoRef = db.ref(`DirectChats/${studentCode}/messages`).push();
                        const arTime = Date.now();
                        const autoReplyMsg = {
                            id: autoRef.key,
                            sender: 'admin',
                            senderName: 'فريق دعم منصة الخطة | EL KHETA 👑',
                            text: `أهلاً بك يا بطل! 🌟\nتم استلام رسالتك وطلبك بنجاح ✨\nسيتم التواصل معك والرد عليك في أقرب وقت ممكن من قبل مسؤولي الدعم الفني والأكاديمي.\n\nفريق منصة الخطة في خدمتك دائماً لمساعدتك ودعم تفوقك! 🚀❤️`,
                            timestamp: arTime,
                            status: 'sent',
                            isAutoReply: true
                        };
                        autoRef.set(autoReplyMsg).then(() => {
                            db.ref(`DirectChats/${studentCode}/meta`).update({
                                lastAutoReply: arTime,
                                lastMessage: '🤖 تم استلام طلبك، فريق الدعم في خدمتك',
                                lastTimestamp: arTime,
                                unreadForStudent: 1
                            });
                        });
                    }, 650);
                }
            });
        }).catch((err) => {
            console.error('Send chat error:', err);
        });
    }

    // 5. Firebase Realtime Listeners
    function setupRealtimeListeners() {
        const db = getDatabase();
        if (!db) {
            setTimeout(setupRealtimeListeners, 1000);
            return;
        }

        // 1. Listen to Admin Status (available / busy / offline)
        db.ref('AdminSupport/Status').on('value', (snap) => {
            const data = snap.val() || {};
            const state = data.state || 'available';
            const dot = document.getElementById('chatAdminStatusDot');
            const txt = document.getElementById('chatAdminStatusText');

            if (state === 'available') {
                if (dot) dot.style.background = '#10B981';
                if (txt) txt.innerHTML = `<i class="fa-solid fa-circle" style="font-size:8px; color:#10B981;"></i> <span>الإدارة متاحة للرد الفوري 🟢</span>`;
            } else if (state === 'busy') {
                if (dot) dot.style.background = '#F59E0B';
                if (txt) txt.innerHTML = `<i class="fa-solid fa-circle" style="font-size:8px; color:#F59E0B;"></i> <span>الإدارة مشغولة حالياً (رد سريع) 🟡</span>`;
            } else {
                if (dot) dot.style.background = '#64748B';
                if (txt) txt.innerHTML = `<i class="fa-solid fa-circle" style="font-size:8px; color:#94A3B8;"></i> <span>خارج أوقات العمل الرسمية ⚫</span>`;
            }
        });

        // 2. Listen to Meta (unread counts & ticket state)
        db.ref(`DirectChats/${studentCode}/meta`).on('value', (snap) => {
            const meta = snap.val() || {};
            const unread = meta.unreadForStudent || 0;
            const badge = document.getElementById('chatUnreadCountBadge');
            const statusTag = document.getElementById('chatTicketStatusTag');

            if (badge) {
                if (unread > 0 && !isDrawerOpen) {
                    badge.style.display = 'inline-block';
                    badge.textContent = unread;
                } else {
                    badge.style.display = 'none';
                }
            }

            if (statusTag) {
                if (meta.status === 'closed') {
                    statusTag.textContent = 'مغلقة ومحلولة ✅';
                    statusTag.style.background = '#F1F5F9';
                    statusTag.style.color = '#64748B';
                } else {
                    statusTag.textContent = 'مفتوحة 💬';
                    statusTag.style.background = '#DCFCE7';
                    statusTag.style.color = '#15803D';
                }
            }
        });

        // 3. Listen to messages stream
        const msgsList = document.getElementById('liveChatMessagesList');
        let initialLoaded = false;

        db.ref(`DirectChats/${studentCode}/messages`).limitToLast(80).on('value', (snap) => {
            msgsList.innerHTML = '';
            if (!snap.exists()) {
                msgsList.innerHTML = `
                    <div style="text-align:center; padding:30px 15px; color:#94A3B8; font-size:13px; font-weight:600;">
                        أهلاً بك يا <b>${studentName}</b>! 👋<br>
                        اكتب سؤالك أو مشكلتك وسيرد عليك مشرف الإدارة فوراً.
                    </div>
                `;
                return;
            }

            snap.forEach((child) => {
                const msg = child.val();
                renderMessageBubble(msg);
            });

            scrollToBottom();

            // Auto-mark as read if student is actively looking at the open drawer
            if (isDrawerOpen) {
                db.ref(`DirectChats/${studentCode}/meta`).update({
                    unreadForStudent: 0
                }).catch(() => {});
            }
        });
    }

    function renderMessageBubble(msg) {
        const msgsList = document.getElementById('liveChatMessagesList');
        if (!msgsList) return;

        const isStudent = (msg.sender === 'student');
        const row = document.createElement('div');
        row.className = `chat-msg-row ${isStudent ? 'student' : 'admin'}`;

        let imgHTML = '';
        if (msg.imageUrl) {
            imgHTML = `<img src="${msg.imageUrl}" class="chat-msg-img" onclick="window.open('${msg.imageUrl}', '_blank')" alt="Attachment">`;
        }

        const checks = isStudent ? (msg.status === 'read' ? '<span style="color:#67E8F9;">✓✓</span>' : '<span>✓</span>') : '';
        const senderLabel = isStudent ? 'أنت' : '👑 الإدارة';

        row.innerHTML = `
            <div class="chat-msg-bubble">
                ${msg.text ? `<div>${escapeHTML(msg.text)}</div>` : ''}
                ${imgHTML}
            </div>
            <div class="chat-msg-meta">
                <span>${senderLabel} • ${formatTime(msg.timestamp)}</span>
                ${checks}
            </div>
        `;

        msgsList.appendChild(row);
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML.replace(/\n/g, '<br>');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }

})();
