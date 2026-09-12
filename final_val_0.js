
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
        }
        if (window.caches) {
            caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        }
        location.replace('lectures.html' + location.search);
    ${'</' + 'script>'}
    <meta http-equiv="refresh" content="0; url=lectures.html">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=2.5">
    <style>
        .subject-hero {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 40px 25px 35px;
            border-radius: 0 0 35px 35px;
            position: relative;
            box-shadow: 0 10px 30px rgba(59,130,246,0.2);
            text-align: right;
        }
        .category-tabs {
            display: flex;
            gap: 10px;
            padding: 15px;
            margin-top: -20px;
            position: relative;
            z-index: 10;
            overflow-x: auto;
            white-space: nowrap;
        }
        .tab-btn {
            flex: 1;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .tab-btn.active {
            background: var(--primary);
            color: var(--text-main);
            border-color: var(--primary);
            box-shadow: 0 6px 18px rgba(9, 132, 227, 0.3);
        }

        .lesson-package {
            background: var(--card-bg);
            border-radius: 16px;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid var(--border-color);
            border-right: 5px solid #3B82F6;
            box-shadow: 0 10px 25px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            gap: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .lesson-package::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, rgba(59,130,246,0.05) 0%, transparent 100%);
            z-index: 0;
            pointer-events: none;
        }
        .lesson-package > * { position: relative; z-index: 1; }
        .lesson-package:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(59,130,246,0.12); border-right-color: #1D4ED8; }
        
        .lesson-header-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
        }
        
        .lesson-title-area {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            flex: 1;
        }
        
        .lesson-number {
            background: linear-gradient(135deg, #2563EB, #3B82F6);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 18px;
            flex-shrink: 0;
            box-shadow: 0 4px 15px rgba(59,130,246,0.4);
            border: 3px solid rgba(255,255,255,0.8);
        }
        
        .lesson-info h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: var(--text-main);
            font-weight: 700;
            line-height: 1.4;
        }
        .lesson-info span {
            font-size: 12px;
            color: var(--text-sub);
        }
        
        .lesson-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 5px;
        }
        
        .action-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }
        .action-btn i { font-size: 16px; font-style: normal; }
        .action-btn:active { transform: scale(0.95); }
        
        .btn-video { background: #EEF2FF; color: #4F46E5; }
        .btn-pdf { background: #FFF7ED; color: #EA580C; }
        .btn-quiz { background: #F0FDF4; color: #16A34A; }
        
        .btn-disabled {
            background: var(--bg);
            color: #94A3B8;
            cursor: not-allowed;
            border: 1px dashed #CBD5E1;
        }
        
        body.dark-theme .btn-video { background: rgba(79,70,229,0.15); color: #818CF8; }
        body.dark-theme .btn-pdf { background: rgba(234,88,12,0.15); color: #F97316; }
        body.dark-theme .btn-quiz { background: rgba(22,163,74,0.15); color: #4ADE80; }
        body.dark-theme .btn-disabled { background: transparent; border-color: rgba(255,255,255,0.1); color: #64748B; }

        /* Video Player Modal (Radical Redesign - Immersive Theater Mode) */
        .player-modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #000;
            z-index: 99999;
            display: none;
            flex-direction: column;
        }
        .player-modal.active { display: flex; }
        .player-content {
            background: #0F1117;
            width: 100%;
            height: 100vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }
        .video-container {
            width: 100%;
            background: #000;
            position: relative;
            /* We will control height via JS dynamically depending on iframe vs video */
            height: 0;
            padding-bottom: 56.25%; 
        }
        .video-container video,
        .video-container iframe {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            border: none;
        }
        .player-body {
            padding: 20px;
            text-align: right;
            flex: 1;
            background: #0F1117;
            color: #fff;
        }
        .player-body h3 { color: #fff !important; }
        .notes-area textarea {
            background: rgba(255,255,255,0.05);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .notes-area textarea:focus { border-color: #818CF8; }
        .modal-close-btn {
            width: 100%; padding: 16px; background: #DC2626; color: #fff;
            border: none; border-radius: 14px; font-weight: bold; font-family: 'Cairo', sans-serif;
            margin-top: 15px; cursor: pointer; transition: 0.3s;
        }
        .modal-close-btn:hover { background: #B91C1C; }
        .player-controls {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            justify-content: space-between;
            align-items: center;
        }
        .speed-btn {
            background: var(--bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        }
        .speed-btn.active {
            background: var(--primary);
            color: var(--text-main);
            border-color: var(--primary);
        }
        .notes-area {
            margin-top: 15px;
        }
        .notes-area textarea {
            width: 100%;
            height: 80px;
            padding: 10px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--bg);
            color: var(--text-main);
            font-family: inherit;
            resize: none;
            box-sizing: border-box;
        }
        .modal-close-btn {
            background: var(--mistake);
            color: var(--text-main);
            border: none;
            padding: 12px;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
        }
    
        /* Community Modal */
        .community-modal {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 100000;
            display: none; align-items: flex-end; justify-content: center;
        }
        .community-modal.active { display: flex; }
        .community-content {
            background: var(--bg); width: 100%; height: 90vh;
            border-radius: 25px 25px 0 0; padding: 20px;
            display: flex; flex-direction: column; position: relative;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
        }
        .community-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;
        }
        .community-messages {
            flex: 1; overflow-y: auto; padding-right: 5px;
            display: flex; flex-direction: column; gap: 15px;
        }
        .msg-bubble {
            background: var(--card-bg); padding: 12px 15px; border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02); max-width: 85%; align-self: flex-end;
            border: 1px solid var(--border); position: relative;
        }
        .msg-bubble.mine {
            background: #EEF2FF; border-color: #C7D2FE; align-self: flex-start;
        }
        body.dark-theme .msg-bubble.mine { background: rgba(79,70,229,0.15); border-color: rgba(79,70,229,0.3); }
        .msg-bubble.admin-reply {
            background: #FFFBEB; border-color: #FDE68A; align-self: flex-end;
        }
        body.dark-theme .msg-bubble.admin-reply { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); }
        .msg-sender { font-size: 11px; font-weight: bold; color: var(--text-sub); margin-bottom: 4px; display:flex; justify-content:space-between; gap: 10px;}
        .msg-sender .admin-badge { background:#F59E0B; color:white; padding:2px 6px; border-radius:4px; font-size:10px; }
        .msg-text { font-size: 14px; color: var(--text-main); word-wrap: break-word; }
        .msg-media img { max-width: 100%; border-radius: 8px; margin-top: 8px; }
        .msg-media audio { max-width: 100%; margin-top: 8px; height:35px; }
        .community-input-area {
            display: flex; gap: 10px; align-items: center; margin-top: 15px;
            padding-top: 15px; border-top: 1px solid var(--border);
        }
        .community-input-area textarea {
            flex: 1; border: 1px solid var(--border); border-radius: 20px; padding: 12px 15px;
            font-family: 'Cairo'; font-size: 14px; resize: none; background: var(--card-bg); color: var(--text-main);
            height: 45px;
        }
        .community-actions { display: flex; gap: 8px; }
        .btn-comm-action {
            width: 45px; height: 45px; border-radius: 50%; border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 18px; color: white; transition: 0.2s;
        }
        .btn-send { background: #4F46E5; }
        .btn-pic { background: #10B981; }
        .btn-mic { background: #EF4444; }
        .btn-mic.recording { animation: pulseMic 1s infinite alternate; }
        @keyframes pulseMic { from { transform:scale(1); opacity:1;} to { transform:scale(1.1); opacity:0.8;} }

</style>
</head>
<body>

    <div class="subject-hero">
        <div class="back-btn" onclick="location.href='courses.html'" style="top: 30px;">⬅️</div>
        <div style="font-size: 13px; opacity: 0.85; font-weight: bold;">منهج ومحاضرات</div>
        <div id="subjectTitle" style="font-size: 22px; font-weight: bold; margin-top: 4px;">المادة الدراسية</div>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
        <button class="tab-btn active" onclick="switchCategory('all', this)"><span>📚</span> الكل</button>
        <button class="tab-btn" onclick="switchCategory('videos', this)"><span>📺</span> المحاضرات</button>
        <button class="tab-btn" onclick="switchCategory('pdfs', this)"><span>📄</span> الملخصات</button>
        <button class="tab-btn" onclick="switchCategory('quizzes', this)"><span>📝</span> الامتحانات</button>
    </div>

    <!-- Search Input -->
    <div class="search-container" style="margin-top: 5px;">
        <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="lessonSearchInput" placeholder="ابحث في الدروس أو المحاضرات..." oninput="filterLessons()">
        </div>
    </div>

    <!-- Content List -->
    <div id="lessonsList" style="padding: 10px 15px 40px;">
        <div style="text-align: center; padding: 50px; color: #BCBCBC;">جاري تحميل المحتوى...</div>
    </div>

    <!-- Custom Video Player Modal -->
    <div class="player-modal" id="playerModal">
        <div class="player-content">
            <div class="video-container" id="videoContainer">
                <video id="customVideoPlayer" controls playsinline controlsList="nodownload" oncontextmenu="return false;" style="display:none;"></video>
                <iframe id="driveIframe" src="" allowfullscreen allow="autoplay" style="width:100%;height:100%;border:none;display:none;"></iframe>
                <div id="driveMobileFallback" style="display:none; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding: 20px; background: #111; position:absolute; top:0; left:0; right:0; bottom:0; z-index: 10;">
                    <div style="font-size: 40px; margin-bottom: 10px;">📱</div>
                    <h4 style="color:white; margin-bottom: 15px; font-size: 14px; line-height: 1.6;">لتجربة مشاهدة أفضل، قم بتشغيل الفيديو بملء الشاشة.</h4>
                    <button id="btnOpenDrive" style="background: #4F46E5; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-family: 'Cairo'; cursor: pointer; font-size: 14px; box-shadow: 0 5px 15px rgba(79,70,229,0.4);">
                        ▶️ تشغيل المحاضرة (ملء الشاشة)
                    </button>
                </div>
            </div>
            <div class="player-body">
                <h3 id="modalVideoTitle" style="margin: 0; color: var(--text-main);">عنوان المحاضرة</h3>
                <div class="player-controls" id="speedControls">
                    <span style="font-size: 13px; color: var(--text-sub);">سرعة التشغيل:</span>
                    <div>
                        <button class="speed-btn active" onclick="setPlaySpeed(1, this)">1.0x</button>
                        <button class="speed-btn" onclick="setPlaySpeed(1.25, this)">1.25x</button>
                        <button class="speed-btn" onclick="setPlaySpeed(1.5, this)">1.5x</button>
                        <button class="speed-btn" onclick="setPlaySpeed(2, this)">2.0x</button>
                    </div>
                </div>

                <div class="notes-area">
                    <label style="font-size: 13px; color: var(--text-sub); display: block; margin-bottom: 5px;">✍️ مفكرة الطالب للمحاضرة:</label>
                    <textarea id="lessonNotes" placeholder="اكتب ملاحظاتك هنا وسيتم حفظها تلقائياً..." oninput="saveNotes()"></textarea>
                </div>

                <button class="modal-close-btn" onclick="closeVideoPlayer()">إغلاق المشغل ✖</button>
            </div>
        </div>
    </div>

    <!-- Bottom Nav -->
    <div class="bottom-nav">
        <a href="home.html" class="nav-item">🏠<br>الرئيسية</a>
        <a href="courses.html" class="nav-item active">📖<br>المواد</a>
        <a href="profile.html" class="nav-item">👤<br>حسابي</a>
    </div>

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js">