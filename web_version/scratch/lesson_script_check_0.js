
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }
    
let currentCommunityLessonId = null;
let communityUnsubscribe = null;
let mediaRecorderCommunity;
let audioChunksCommunity = [];
let isRecordingCommunity = false;

function openCommunity(lessonId, lessonTitle) {
    if(!lessonId) lessonId = 'unknown';
    currentCommunityLessonId = lessonId;
    document.getElementById('communityTitle').textContent = 'نقاشات: ' + lessonTitle;
    document.getElementById('communityModal').classList.add('active');
    loadCommunityMessages();
}

function closeCommunity() {
    document.getElementById('communityModal').classList.remove('active');
    if(communityUnsubscribe) {
        database.ref(`Community/${subject}/${currentCommunityLessonId}`).off('value', communityUnsubscribe);
        communityUnsubscribe = null;
    }
}

function loadCommunityMessages() {
    const messagesContainer = document.getElementById('communityMessages');
    messagesContainer.innerHTML = '<div style="text-align:center; padding:20px;">جاري التحميل...</div>';
    
    communityUnsubscribe = database.ref(`Community/${subject}/${currentCommunityLessonId}`).on('value', snap => {
        messagesContainer.innerHTML = '';
        if(!snap.exists()) {
            messagesContainer.innerHTML = '<div style="text-align:center; padding:20px; color:gray;">لا توجد رسائل بعد. كن أول من يشارك!</div>';
            return;
        }
        const msgs = [];
        snap.forEach(child => { msgs.push({id: child.key, ...child.val()}); });
        
        msgs.forEach(msg => {
            const isMine = msg.senderCode === window.currentUserCode;
            const isAdmin = msg.isAdmin;
            let bubbleClass = isMine ? 'msg-bubble mine' : 'msg-bubble';
            if(isAdmin) bubbleClass = 'msg-bubble admin-reply';
            
            let mediaHtml = '';
            if(msg.type === 'image') mediaHtml = `<img src="${msg.mediaUrl}" onclick="window.open('${msg.mediaUrl}')" style="cursor:pointer;">`;
            if(msg.type === 'audio') mediaHtml = `<audio controls src="${msg.mediaUrl}"></audio>`;
            
            let senderName = msg.senderName || 'طالب';
            if(isAdmin) senderName += ' <span class="admin-badge">إدمن المنصة</span>';

            const timeStr = new Date(msg.timestamp).toLocaleString('ar-EG', {hour:'2-digit', minute:'2-digit'});
            
            messagesContainer.innerHTML += `
                <div class="${bubbleClass}">
                    <div class="msg-sender">${senderName} <span>${timeStr}</span></div>
                    ${msg.text ? `<div class="msg-text">${msg.text}</div>` : ''}
                    <div class="msg-media">${mediaHtml}</div>
                </div>
            `;
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

function sendCommunityMessage(text = '', type = 'text', mediaUrl = null) {
    if(type === 'text') {
        text = document.getElementById('communityMsgInput').value.trim();
        if(!text) return;
        document.getElementById('communityMsgInput').value = '';
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const msgData = {
        senderCode: window.currentUserCode || user.studentCode || 'unknown',
        senderName: user.fullName || 'طالب',
        text: text,
        type: type,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    if(mediaUrl) msgData.mediaUrl = mediaUrl;
    
    database.ref(`Community/${subject}/${currentCommunityLessonId}`).push(msgData);
}

function handleCommunityImage(input) {
    if(!input.files || !input.files[0]) return;
    const file = input.files[0];
    input.value = '';
    showToast('جاري رفع الصورة...', 'info');
    
    const storageRef = firebase.storage().ref(`community/${currentCommunityLessonId}/${Date.now()}_${file.name}`);
    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(url => {
        sendCommunityMessage('', 'image', url);
        showToast('تم الإرسال', 'success');
    }).catch(e => {
        console.error(e);
        showToast('فشل رفع الصورة', 'error');
    });
}

async function toggleCommunityMic() {
    const btn = document.getElementById('btnMicCommunity');
    if(isRecordingCommunity) {
        mediaRecorderCommunity.stop();
        btn.classList.remove('recording');
        isRecordingCommunity = false;
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderCommunity = new MediaRecorder(stream);
        audioChunksCommunity = [];
        mediaRecorderCommunity.ondataavailable = e => { if(e.data.size > 0) audioChunksCommunity.push(e.data); };
        mediaRecorderCommunity.onstop = () => {
            const audioBlob = new Blob(audioChunksCommunity, { type: 'audio/webm' });
            stream.getTracks().forEach(t => t.stop());
            showToast('جاري رفع التسجيل...', 'info');
            
            const storageRef = firebase.storage().ref(`community/${currentCommunityLessonId}/${Date.now()}.webm`);
            storageRef.put(audioBlob).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                sendCommunityMessage('', 'audio', url);
                showToast('تم الإرسال', 'success');
            }).catch(e => {
                console.error(e);
                showToast('فشل رفع الصوت', 'error');
            });
        };
        mediaRecorderCommunity.start();
        btn.classList.add('recording');
        isRecordingCommunity = true;
    } catch(err) {
        console.error(err);
        showToast('لا يمكن الوصول للميكروفون', 'error');
    }
}

