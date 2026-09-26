/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 🎓 ELKHETA SMART ACADEMIC ASSISTANT SUITE (المساعد الأكاديمي الشامل - 20 أداة)
 * Interactive Pedagogical Companion for Lectures, Flashcards, Mindmaps & Success
 * ═════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    if (window.ElkhetaAcademicAssistant) return;

    class AcademicAssistantEngine {
        constructor() {
            this.activeLecture = null;
            this.isOpen = false;
            this.activeCategory = 1;
            this.activeToolId = null;
            this.audioPlaying = false;
            this.audioUtterance = null;
            this.audioElement = null;
            this.audioCurrentSpeed = 1;
            this.pomodoroTimer = null;
            this.pomodoroSecondsLeft = 25 * 60;
            this.pomodoroRunning = false;
            
            // Flashcard state
            this.currentFcIndex = 0;
            this.fcMastered = 0;
            this.fcReview = 0;

            this.init();
        }

        init() {
            this.createBackdropAndDrawer();
            this.bindGlobalTriggers();
            this.detectCurrentLecture();
        }

        /* ─── Global Seek Lecture Video Helper ─── */
        seekToVideoTime(seconds) {
            try {
                if (typeof window.sendYtCustomCommand === 'function') {
                    if (window.customPlayerState) window.customPlayerState.currentTime = seconds;
                    window.sendYtCustomCommand('seekTo', [seconds, true]);
                    if (typeof window.updateCustomScrubUI === 'function') window.updateCustomScrubUI();
                } else if (typeof window.customPlayerSeekRel === 'function') {
                    window.customPlayerSeekRel(0);
                }
                // Scroll up smoothly to the player
                const player = document.getElementById('customPlayerMainWrap') || document.getElementById('videoContainerWrapper');
                if (player) {
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } catch (e) {
                console.warn('Seek error:', e);
            }
        }

        /* ─── Read or Set Active Lecture ─── */
        setLecture(lecture) {
            this.activeLecture = lecture;
            const tag = document.getElementById('elkDrawerLectureTag');
            if (tag && lecture) {
                tag.innerHTML = `<span class="dot"></span> ${lecture.title || lecture.subjectName || 'المحاضرة الحالية'}`;
            }
            // If drawer is open and a tool is active, refresh the view
            if (this.isOpen && this.activeToolId) {
                this.renderToolDetail(this.activeToolId);
            }
        }

        detectCurrentLecture() {
            if (window.activeLecture) {
                this.setLecture(window.activeLecture);
            } else if (window.realLecturesList && window.realLecturesList.length > 0) {
                this.setLecture(window.realLecturesList[0]);
            }
        }

        /* ─── DOM CREATION: BACKDROP & DRAWER ─── */
        createBackdropAndDrawer() {
            // 1. Backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'elk-assistant-backdrop';
            backdrop.id = 'elkAssistantBackdrop';
            backdrop.onclick = () => this.toggleSidebar(false);
            document.body.appendChild(backdrop);

            // 2. Floating Action Pill
            const fab = document.createElement('div');
            fab.className = 'elk-assistant-btn';
            fab.id = 'elkAssistantFloatingBtn';
            fab.innerHTML = `
                <div class="bot-pulse">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div class="btn-text-box">
                    <span class="title">المساعد الأكاديمي</span>
                    <span class="sub">تلخيص وشرح ذكي 💡</span>
                </div>
            `;
            fab.onclick = () => this.toggleSidebar(true);
            document.body.appendChild(fab);

            // 3. Smart Drawer
            const drawer = document.createElement('aside');
            drawer.className = 'elk-assistant-drawer';
            drawer.id = 'elkAssistantDrawer';
            drawer.innerHTML = `
                <!-- Header -->
                <div class="elk-drawer-header">
                    <div class="elk-drawer-header-left">
                        <div class="elk-drawer-avatar">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div class="elk-drawer-title-group">
                            <h3>المساعد الأكاديمي الشامل 🎓</h3>
                            <div class="elk-drawer-subbadge" id="elkDrawerLectureTag">
                                <span class="dot"></span> جاري تهيئة المحاضرة...
                            </div>
                        </div>
                    </div>
                    <button type="button" class="elk-drawer-close-btn" id="elkDrawerCloseBtn" title="إغلاق">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Category Switcher Tabs -->
                <div class="elk-cat-tabs-container" id="elkCategoryTabs">
                    <button type="button" class="elk-cat-tab-btn active" onclick="window.ElkhetaAcademicAssistant.switchCategory(1)">
                        <i class="fa-solid fa-scale-balanced"></i>
                        <span>1. فك المتشابهات</span>
                    </button>
                    <button type="button" class="elk-cat-tab-btn" onclick="window.ElkhetaAcademicAssistant.switchCategory(2)">
                        <i class="fa-solid fa-file-invoice"></i>
                        <span>2. التلخيص والمصادر</span>
                    </button>
                    <button type="button" class="elk-cat-tab-btn" onclick="window.ElkhetaAcademicAssistant.switchCategory(3)">
                        <i class="fa-solid fa-bolt"></i>
                        <span>3. التدريب التفاعلي</span>
                    </button>
                    <button type="button" class="elk-cat-tab-btn" onclick="window.ElkhetaAcademicAssistant.switchCategory(4)">
                        <i class="fa-solid fa-stethoscope"></i>
                        <span>4. التشخيص والربط</span>
                    </button>
                    <button type="button" class="elk-cat-tab-btn" onclick="window.ElkhetaAcademicAssistant.switchCategory(5)">
                        <i class="fa-solid fa-bullseye"></i>
                        <span>5. التطبيق والتفوق</span>
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="elk-drawer-search-wrap">
                    <div class="elk-drawer-search-box">
                        <i class="fa-solid fa-magnifying-glass" style="color: var(--ast-text-muted);"></i>
                        <input type="text" id="elkAssistantSearchInput" placeholder="ابحث في أدوات المساعد أو مصطلحات الدرس..." oninput="window.ElkhetaAcademicAssistant.handleSearch(this.value)">
                    </div>
                </div>

                <!-- Drawer Body Container -->
                <div class="elk-drawer-body" id="elkDrawerBody">
                    <!-- Dynamic Tool List or Tool Detail will render here -->
                </div>
            `;
            document.body.appendChild(drawer);

            // Bind close button
            const closeBtn = document.getElementById('elkDrawerCloseBtn');
            if (closeBtn) closeBtn.onclick = () => this.toggleSidebar(false);

            // Initial render of category 1 tools
            this.renderCategoryTools(1);
        }

        bindGlobalTriggers() {
            // Escape key closes drawer
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.toggleSidebar(false);
                }
            });
        }

        toggleSidebar(open) {
            const drawer = document.getElementById('elkAssistantDrawer');
            const backdrop = document.getElementById('elkAssistantBackdrop');
            if (!drawer || !backdrop) return;

            this.isOpen = (open !== undefined) ? open : !this.isOpen;
            if (this.isOpen) {
                drawer.classList.add('open');
                backdrop.classList.add('open');
                document.body.classList.add('elk-drawer-active');
                this.detectCurrentLecture();
            } else {
                drawer.classList.remove('open');
                backdrop.classList.remove('open');
                document.body.classList.remove('elk-drawer-active');
                this.stopPodcastAudio();
            }
        }

        switchCategory(catNum) {
            this.activeCategory = catNum;
            this.activeToolId = null;

            // Update Tab UI
            const tabs = document.querySelectorAll('.elk-cat-tab-btn');
            tabs.forEach((t, idx) => {
                if (idx + 1 === catNum) t.classList.add('active');
                else t.classList.remove('active');
            });

            this.renderCategoryTools(catNum);
        }

        /* ─── 30 TOOLS REGISTRY DEFINITION (5 Categories x 6 Tools) ─── */
        getToolsList() {
            return [
                // Category 1: معالجة اللبس وفك المتشابهات (6 أدوات)
                { id: 'confusing_terms', cat: 1, title: 'متشابهات وفروقات دقيقة (15 مقارنة)', desc: 'مقارنات ذكية وجدول فوري للمفاهيم والتعاريف المتشابهة', icon: 'fa-scale-balanced', color: '#D4973B' },
                { id: 'exam_traps', cat: 1, title: 'كمائن وأفخاخ الامتحانات (15 فخ)', desc: 'أشهر التريكات والخدع وصيغ الأسئلة الخادعة والقواعد الذهبية', icon: 'fa-triangle-exclamation', color: '#EF4444' },
                { id: 'mcq_analyzer', cat: 1, title: 'فروق الاختيارات (MCQ Analyzer)', desc: 'ليه دي صح والباقي غلط؟ تحليل دقيق لبدائل السؤال', icon: 'fa-list-check', color: '#3B82F6' },
                { id: 'mnemonics', cat: 1, title: 'شفرات الحفظ الذكية (Mnemonics)', desc: 'اختصارات ذهنية وروابط ثلاثية ورباعية لتثبيت القوائم', icon: 'fa-key', color: '#8B5CF6' },
                { id: 'keywords_scanner', cat: 1, title: 'رادار الكلمات المفتاحية بالأسئلة', desc: 'كاشف الكلمات التوجيهية في رأس السؤال (حصراً، نسبية، إجرائياً)', icon: 'fa-crosshairs', color: '#06B6D4' },
                { id: 'true_false_detector', cat: 1, title: 'كاشف صيغ صح وخطأ الخادعة', desc: 'تحليل الكلمات المطلقة الخادعة (دائماً، جميع، مطلقاً، لا يتأثر)', icon: 'fa-circle-question', color: '#EC4899' },

                // Category 2: التلخيص واستخراج المحتوى من الفيديو والـ PDF (6 أدوات)
                { id: 'capsule', cat: 2, title: 'كبسولة القوانين والتعريفات', desc: 'ملخص مركز شامل الفصل كله جاهز للطباعة والمراجعة', icon: 'fa-capsules', color: '#10B981' },
                { id: 'mind_map', cat: 2, title: 'خريطة ذهنية تفاعلية (Mind Map)', desc: 'شجرة مرئية تفاعلية تربط شروحات الفيديو بالمذكرة', icon: 'fa-diagram-project', color: '#6366F1' },
                { id: 'chapter_summary', cat: 2, title: 'الموجز الذهبي للفصل', desc: 'ملخص شامل ومفصل لجميع عناصر ونقاط الدرس الرئيسية', icon: 'fa-book-open', color: '#EC4899' },
                { id: 'glossary', cat: 2, title: 'قاموس مصطلحات الدرس (عربي/إنجليزي)', desc: 'مسرد أبجدي بالمصطلحات العلمية وتعريفاتها وأمثلتها', icon: 'fa-book-atlas', color: '#F59E0B' },
                { id: 'diagram_decoder', cat: 2, title: 'تفسير المخططات والرسوم', desc: 'تفكيك منحنيات ورسومات المذكرة لنقاط نصية صريحة', icon: 'fa-chart-pie', color: '#06B6D4' },
                { id: 'cheat_sheet', cat: 2, title: 'ورقة مراجعة ليلة الامتحان (Cheat Sheet)', desc: 'ملخص صفحة واحدة مكثف للمراجعة السريعة في 5 دقائق', icon: 'fa-file-lines', color: '#D4973B' },

                // Category 3: الاختبارات والتدريب التفاعلي (6 أدوات)
                { id: 'flashcards', cat: 3, title: 'بطاقات التثبيت الذكية (Flashcards)', desc: 'بطاقات بوجه السؤال وظهر الإجابة ومؤشر إتقان فوري', icon: 'fa-clone', color: '#D4973B' },
                { id: 'exam_predictions', cat: 3, title: 'توقع امتحانات (Top 10)', desc: 'أهم 10 أسئلة متوقعة بمستويات صعوبة مختلفة وإجاباتها', icon: 'fa-fire-flame-curved', color: '#DC2626' },
                { id: 'smart_recite', cat: 3, title: 'سمّع لي (المُسمّع الذكي)', desc: 'تسميع ذاتي بالذكاء الاصطناعي وتقييم الكلمات المفتاحية', icon: 'fa-microphone-lines', color: '#10B981' },
                { id: 'essay_scorer', cat: 3, title: 'سؤال مقالي وتصحيح فوري', desc: 'تدريب مقالي بسلم تصحيح وعناصر نموذجية معتمدة', icon: 'fa-pen-to-square', color: '#2563EB' },
                { id: 'speed_drill', cat: 3, title: 'تحدي السرعة 60 ثانية (Speed Drill)', desc: 'أسئلة خاطفة سريعة لقياس سرعة البديهة واستحضار المعلومة', icon: 'fa-gauge-high', color: '#F97316' },
                { id: 'step_by_step', cat: 3, title: 'حل المواقف التطبيقية خطوة بخطوة', desc: 'تفكيك الحالات التطبيقية ومواقف الأخصائي بالأرقام', icon: 'fa-stairs', color: '#7C3AED' },

                // Category 4: التشخيص والربط والفهم العميق (6 أدوات)
                { id: 'timestamp_query', cat: 4, title: 'اسأل عن دقيقة محددة بالفيديو', desc: 'قفز فوري للدقيقة الدقيقة في فيديو المحاضرة مع ملخصها', icon: 'fa-clock-rotate-left', color: '#D4973B' },
                { id: 'weakness_finder', cat: 4, title: 'حدد نقطة ضعفي (كويز تشخيصي)', desc: '3 أسئلة لتشخيص الفهم مع قفز تلقائي لجزئية الخطأ', icon: 'fa-bullseye', color: '#EF4444' },
                { id: 'feynman_simple', cat: 4, title: 'اشرحها لي بالعامية (أسلوب فاينمان)', desc: 'مبدأ فاينمان بأمثلة وتشبيهات يومية دارجة مصرية', icon: 'fa-comments', color: '#059669' },
                { id: 'prerequisites', cat: 4, title: 'المتطلبات السابقة والتراكمي', desc: 'الأساسيات والقواعد السابقة الواجب استحضارها قبل الدرس', icon: 'fa-link', color: '#4B5563' },
                { id: 'derivation', cat: 4, title: 'استنتج المفهوم ومساره التاريخي', desc: 'خطوات الاشتقاق العلمي والتطور النظري للمبدأ', icon: 'fa-lightbulb', color: '#F59E0B' },
                { id: 'why_how_what', cat: 4, title: 'ثلاثية الفهم: ماذا ولماذا وكيف؟', desc: 'مصفوفة تحليلية تفكك المفاهيم المعقدة إلى 3 أبعاد واضحة', icon: 'fa-cubes', color: '#6366F1' },

                // Category 5: مهارات التفوق والتطبيق العملي (6 أدوات)
                { id: 'study_planner', cat: 5, title: 'خطة المذاكرة ومؤقت بومودورو', desc: 'جدول زمني مقترح للدرس + مؤقت تركيز 25 دقيقة', icon: 'fa-stopwatch', color: '#E11D48' },
                { id: 'case_study', cat: 5, title: 'دراسة حالة ميدانية واقعية', desc: 'موقف تطبيقي مع عميل وكيفية تصرف الأخصائي باحترافية', icon: 'fa-user-doctor', color: '#059669' },
                { id: 'oral_exam', cat: 5, title: 'بنك أسئلة الشفوي والمناقشات', desc: 'أهم أسئلة الشفوي المتوقعة مع الصياغة الاحترافية للإجابة', icon: 'fa-comments-dollar', color: '#2563EB' },
                { id: 'critical_thinking', cat: 5, title: 'سؤال التفكير النقدي والمستويات العليا', desc: 'تحليل مواقف غير تقليدية وفق هرم بلوم للمستويات العليا', icon: 'fa-brain', color: '#7C3AED' },
                { id: 'revision_checklist', cat: 5, title: 'قائمة التحقق قبل الامتحان (Checklist)', desc: 'قائمة تفاعلية تتيح لك التأكد من جاهزيتك 100% لكل عنصر', icon: 'fa-square-check', color: '#10B981' },
                { id: 'ask_tutor', cat: 5, title: 'مستشار الاستفسار الفوري الذكي', desc: 'إجابة فورية ونموذجية على أي سؤال أو استفسار داخل المقرر', icon: 'fa-headset', color: '#D4973B' }
            ];
        }

        /* ─── RENDER CATEGORY TOOLS ─── */
        renderCategoryTools(catNum) {
            const body = document.getElementById('elkDrawerBody');
            if (!body) return;

            const allTools = this.getToolsList();
            const filtered = allTools.filter(t => t.cat === catNum);

            body.innerHTML = `
                <div class="elk-tools-grid">
                    ${filtered.map(tool => `
                        <div class="elk-tool-card" onclick="window.ElkhetaAcademicAssistant.openTool('${tool.id}')">
                            <div class="elk-tool-card-left">
                                <div class="elk-tool-icon-box" style="background: ${tool.color}15; color: ${tool.color};">
                                    <i class="fa-solid ${tool.icon}"></i>
                                </div>
                                <div class="elk-tool-info">
                                    <div class="elk-tool-name">${tool.title}</div>
                                    <div class="elk-tool-desc">${tool.desc}</div>
                                </div>
                            </div>
                            <div class="elk-tool-open-btn">
                                <i class="fa-solid fa-arrow-left"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        handleSearch(query) {
            const q = (query || '').trim().toLowerCase();
            const body = document.getElementById('elkDrawerBody');
            if (!body) return;

            if (!q) {
                this.renderCategoryTools(this.activeCategory);
                return;
            }

            const allTools = this.getToolsList();
            const matched = allTools.filter(t => 
                t.title.toLowerCase().includes(q) || 
                t.desc.toLowerCase().includes(q)
            );

            if (matched.length === 0) {
                body.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--ast-text-muted);">
                        <i class="fa-solid fa-face-meh" style="font-size: 36px; margin-bottom: 12px; color: var(--ast-gold);"></i>
                        <div style="font-size: 14px; font-weight: 800;">لم يتم العثور على أداة مطابقة لـ "${query}"</div>
                        <div style="font-size: 12px; margin-top: 4px;">جرب البحث بكلمة أخرى مثل: امتحان، مقارنة، تلخيص، صوتي</div>
                    </div>
                `;
                return;
            }

            body.innerHTML = `
                <div style="font-size: 12px; font-weight: 800; color: var(--ast-gold); margin-bottom: 8px;">
                    نتائج البحث (${matched.length}):
                </div>
                <div class="elk-tools-grid">
                    ${matched.map(tool => `
                        <div class="elk-tool-card" onclick="window.ElkhetaAcademicAssistant.openTool('${tool.id}')">
                            <div class="elk-tool-card-left">
                                <div class="elk-tool-icon-box" style="background: ${tool.color}15; color: ${tool.color};">
                                    <i class="fa-solid ${tool.icon}"></i>
                                </div>
                                <div class="elk-tool-info">
                                    <div class="elk-tool-name">${tool.title}</div>
                                    <div class="elk-tool-desc">${tool.desc}</div>
                                </div>
                            </div>
                            <div class="elk-tool-open-btn">
                                <i class="fa-solid fa-arrow-left"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        /* ─── OPEN SPECIFIC TOOL DETAIL ─── */
        openTool(toolId) {
            this.activeToolId = toolId;
            this.toggleSidebar(true);
            this.renderToolDetail(toolId);
        }

        renderToolDetail(toolId) {
            const body = document.getElementById('elkDrawerBody');
            if (!body) return;

            const toolInfo = this.getToolsList().find(t => t.id === toolId) || { title: 'الأداة التفاعلية', icon: 'fa-wand-magic-sparkles', cat: 1 };
            const data = this.getCurriculumData();

            let toolContentHtml = '';

            switch(toolId) {
                // 1. متشابهات بتلخبط
                case 'confusing_terms':
                    toolContentHtml = `
                        <div class="elk-comparison-table-wrap">
                            <table class="elk-comp-table">
                                <thead>
                                    <tr>
                                        <th>المصطلح الأول</th>
                                        <th>المصطلح المقابل</th>
                                        <th>الفارق الجوهري الفاصل</th>
                                        <th>الفخ الشائع في الامتحان</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.confusingTerms.map(row => `
                                        <tr>
                                            <td><strong>${row.term1}</strong></td>
                                            <td><strong>${row.term2}</strong></td>
                                            <td style="color:#059669;">${row.difference}</td>
                                            <td style="color:#DC2626;">⚠️ ${row.trap}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="background:var(--ast-gold-light); border:1px solid var(--ast-gold-border); border-radius:10px; padding:12px; font-size:12px; color:var(--ast-gold-text); line-height:1.6;">
                            💡 <strong>نصيحة ذهبية:</strong> واضع الامتحان يتعمد استبدال كلمات التعريفين في أسئلة (صح أو خطأ)، انتبه دائماً للفاعل والهدف النهائي!
                        </div>
                    `;
                    break;

                // 2. أفخاخ الامتحانات
                case 'exam_traps':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${data.examTraps.map((trap, idx) => `
                                <div class="elk-trap-card">
                                    <div class="elk-trap-badge">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                        <span>فخ ${idx + 1}: ${trap.title}</span>
                                    </div>
                                    <div class="elk-trap-title">« ${trap.exampleQuestion} »</div>
                                    <div class="elk-trap-content">
                                        <strong>الخدعة:</strong> ${trap.trick}<br>
                                        <strong style="color:#059669;">القاعدة الذهبية للنجاة:</strong> ${trap.goldenRule}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 3. فروق الاختيارات (MCQ Analyzer)
                case 'mcq_analyzer':
                    toolContentHtml = `
                        <div class="elk-mcq-analyzer">
                            <div class="elk-mcq-qtext">${data.mcqAnalyzer.question}</div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.mcqAnalyzer.options.map(opt => `
                                    <div class="elk-mcq-opt ${opt.isCorrect ? 'correct' : 'wrong'}">
                                        <div class="elk-mcq-opt-label">
                                            <span>${opt.letter}) ${opt.text}</span>
                                            <span>${opt.isCorrect ? '✅ الإجابة النموذجية' : '❌ خيار خاطئ'}</span>
                                        </div>
                                        <div class="elk-mcq-opt-expl">${opt.explanation}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 4. شفرات الحفظ (Mnemonics)
                case 'mnemonics':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${data.mnemonics.map(m => `
                                <div class="elk-mnemonic-box">
                                    <div style="font-size:13.5px; font-weight:800; color:var(--ast-text-title);">${m.title}</div>
                                    <div class="elk-mnemonic-code">${m.code}</div>
                                    <ul class="elk-mnemonic-list">
                                        ${m.items.map(it => `<li>🔹 <strong>${it.letter}:</strong> ${it.meaning}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 5. كبسولة القوانين والتعريفات
                case 'capsule':
                    toolContentHtml = `
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <span style="font-size:12px; font-weight:800; color:var(--ast-gold);">📄 ورقة مركزة شاملة الفصل كله</span>
                            <button type="button" onclick="window.print()" style="padding:6px 12px; background:var(--ast-gold-grad); color:#FFF; border:none; border-radius:8px; font-size:11.5px; font-weight:800; cursor:pointer;">
                                <i class="fa-solid fa-print"></i> طباعة كبسولة الفصل
                            </button>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${data.capsule.map(item => `
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px;">
                                    <div style="font-size:13px; font-weight:900; color:var(--ast-gold);">${item.heading}</div>
                                    <div style="font-size:12px; color:var(--ast-text-body); line-height:1.6;">${item.body}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 6. خريطة ذهنية تفاعلية
                case 'mind_map':
                    toolContentHtml = `
                        <div class="elk-mindmap-tree">
                            <div class="elk-mm-node root">
                                🌟 ${data.mindMap.root}
                            </div>
                            ${data.mindMap.branches.map(b => `
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div class="elk-mm-node" style="font-weight:800; background:var(--ast-gold-light); color:var(--ast-gold-text); border-color:var(--ast-gold-border);">
                                        📁 ${b.title}
                                    </div>
                                    <div class="elk-mm-branches">
                                        ${b.subItems.map(s => `
                                            <div class="elk-mm-branch-item">
                                                <strong>• ${s.title}:</strong> ${s.detail}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 7. الموجز الذهبي للفصل (ملخص شامل ومفصل)
                case 'chapter_summary':
                    toolContentHtml = `
                        <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:16px;">
                            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--ast-border); padding-bottom:14px; flex-wrap:wrap; gap:10px;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #EC4899, #BE185D); display:flex; align-items:center; justify-content:center; color:#FFF; font-size:18px;">
                                        <i class="fa-solid fa-book-open"></i>
                                    </div>
                                    <div>
                                        <div style="font-size:15px; font-weight:900; color:var(--ast-text);">الموجز الذهبي الشامل للفصل</div>
                                        <div style="font-size:11.5px; color:var(--ast-text-muted);">عصارة الشرح المستخرجة بدقة من فيديو المحاضرة ومذكرة الـ PDF</div>
                                    </div>
                                </div>
                                <button type="button" onclick="window.print()" style="padding:7px 14px; background:rgba(236,72,153,0.1); color:#EC4899; border:1px solid rgba(236,72,153,0.25); border-radius:10px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <i class="fa-solid fa-print"></i> طباعة الموجز
                                </button>
                            </div>

                            <div style="background:rgba(236,72,153,0.04); border:1px solid rgba(236,72,153,0.18); border-radius:12px; padding:14px; display:flex; align-items:flex-start; gap:10px;">
                                <i class="fa-solid fa-lightbulb" style="color:#EC4899; font-size:16px; margin-top:2px;"></i>
                                <div style="font-size:12px; line-height:1.6; color:var(--ast-text-body);">
                                    <strong>دليل المذاكرة السريعة:</strong> هذا الموجز يجمع أهم المحاور والمفاهيم العلمية المقررة في هذا الفصل بأسلوب سلس ومباشر يغنيك عن التشتت بين مصادر متعددة.
                                </div>
                            </div>

                            <div style="background:rgba(0,0,0,0.02); border:1px solid var(--ast-border); border-radius:12px; padding:18px; font-size:13.5px; color:var(--ast-text-body); line-height:1.9;">
                                ${(data.chapterSummary && data.chapterSummary.content) || (data.podcast && data.podcast.script) || ''}
                            </div>
                        </div>
                    `;
                    break;

                // 8. قاموس مصطلحات الدرس
                case 'glossary':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${data.glossary.map(g => `
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px;">
                                    <div style="display:flex; align-items:center; justify-content:space-between;">
                                        <span style="font-size:13.5px; font-weight:900; color:var(--ast-text-title);">${g.ar}</span>
                                        <span style="font-size:11px; font-weight:700; color:var(--ast-gold); background:var(--ast-gold-light); padding:2px 8px; border-radius:6px; font-family:monospace;">${g.en}</span>
                                    </div>
                                    <div style="font-size:12px; color:var(--ast-text-body); line-height:1.5;">${g.definition}</div>
                                    <div style="font-size:11px; color:#059669; font-style:italic;">📌 مثال تطبيقي: ${g.example}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 9. تفسير الرسوم والمخططات
                case 'diagram_decoder':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${data.diagrams.map(d => `
                                <div style="background:var(--ast-surface); border:1.5px solid var(--ast-border); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                    <div style="font-size:13.5px; font-weight:900; color:var(--ast-gold); display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-chart-line"></i>
                                        <span>${d.title}</span>
                                    </div>
                                    <div style="font-size:12px; color:var(--ast-text-muted);">${d.context}</div>
                                    <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
                                        ${d.stages.map((st, i) => `
                                            <div style="background:var(--ast-surface-soft); border-right:3px solid var(--ast-gold); padding:8px 12px; border-radius:6px; font-size:12px;">
                                                <strong>مرحلة ${i + 1} (${st.name}):</strong> ${st.meaning}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 10. بطاقات التثبيت الذكية (Flashcards)
                case 'flashcards':
                    this.currentFcIndex = 0;
                    toolContentHtml = `
                        <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; font-weight:800;">
                            <span id="fcCounterText">بطاقة 1 من ${data.flashcards.length}</span>
                            <span style="color:#059669;">متقنة: <span id="fcMasteredNum">${this.fcMastered}</span> ✅</span>
                        </div>

                        <div class="elk-flashcard-stage" id="elkFcStage" onclick="this.classList.toggle('flipped')">
                            <div class="elk-flashcard-inner">
                                <div class="elk-fc-front">
                                    <div class="elk-fc-tip">💡 انقر على البطاقة لقلبها وكشف الإجابة</div>
                                    <div class="elk-fc-question" id="fcFrontText">${data.flashcards[0].q}</div>
                                    <div style="font-size:11px; color:var(--ast-text-muted);"><i class="fa-solid fa-rotate"></i> انقر للقلب</div>
                                </div>
                                <div class="elk-fc-back">
                                    <div class="elk-fc-tip" style="color:#FDE68A;">الإجابة النموذجية المركزة:</div>
                                    <div class="elk-fc-answer" id="fcBackText">${data.flashcards[0].a}</div>
                                    <div style="font-size:11px; color:#CBD5E1;">اضغط على تقييمك أدناه</div>
                                </div>
                            </div>
                        </div>

                        <div class="elk-fc-actions-row">
                            <button type="button" class="elk-btn-fc-repeat" onclick="window.ElkhetaAcademicAssistant.nextFlashcard(false)">
                                <i class="fa-solid fa-rotate-right"></i> محتاج أراجعها
                            </button>
                            <button type="button" class="elk-btn-fc-know" onclick="window.ElkhetaAcademicAssistant.nextFlashcard(true)">
                                <i class="fa-solid fa-circle-check"></i> متقن وعارفها
                            </button>
                        </div>
                    `;
                    break;

                // 11. توقع امتحانات (Top 10)
                case 'exam_predictions':
                    toolContentHtml = `
                        <div style="font-size:12px; color:var(--ast-text-muted); margin-bottom:4px;">
                            🔥 أهم 10 أسئلة متوقعة في الامتحان النهائي بناءً على تكرار الامتحانات السابقة:
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${data.top10Predictions.map((pred, i) => `
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; align-items:center; justify-content:space-between;">
                                        <span style="font-size:13px; font-weight:900; color:var(--ast-text-title);">س${i + 1}: ${pred.q}</span>
                                        <span style="font-size:10.5px; font-weight:800; background:#FEE2E2; color:#DC2626; padding:2px 8px; border-radius:8px;">توقع ${pred.probability}% 🔥</span>
                                    </div>
                                    <div style="font-size:12px; color:#059669; background:var(--ast-green-light); padding:8px; border-radius:8px; line-height:1.5;">
                                        <strong>الإجابة النموذجية:</strong> ${pred.modelAnswer}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 12. سمّع لي (المُسمّع الذكي)
                case 'smart_recite':
                    toolContentHtml = `
                        <div class="elk-recite-box">
                            <div style="font-size:13px; font-weight:800; color:var(--ast-text-title);">
                                🎙️ المطلوب تسميعه: <strong>${data.recitePrompt.topic}</strong>
                            </div>
                            <div style="font-size:11.5px; color:var(--ast-text-muted);">
                                اكتب ما تتذكره من عناصر وتعريفات وسيقوم الذكاء الاصطناعي بفحص الكلمات المفتاحية فورياً:
                            </div>
                            <textarea id="elkReciteInput" class="elk-recite-input" placeholder="اكتب تسميعك هنا بنقاط واضحة..."></textarea>
                            <button type="button" onclick="window.ElkhetaAcademicAssistant.evaluateRecitation()" style="padding:10px; background:var(--ast-gold-grad); color:#FFF; border:none; border-radius:10px; font-weight:800; cursor:pointer;">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> افحص التسميع وقارن الكلمات المفتاحية
                            </button>
                            <div id="elkReciteFeedback" style="display:none;"></div>
                        </div>
                    `;
                    break;

                // 13. سؤال مقالي وتصحيح فوري
                case 'essay_scorer':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:var(--ast-surface); border:1.5px solid var(--ast-border); border-radius:12px; padding:14px;">
                                <div style="font-size:14px; font-weight:900; color:var(--ast-text-title); line-height:1.5;">
                                    📝 سؤال مقالي: ${data.essayQuestion.question}
                                </div>
                            </div>
                            <textarea id="elkEssayInput" class="elk-recite-input" placeholder="اكتب مسودتك الإنشائية هنا للتدرب على الصياغة..."></textarea>
                            <button type="button" onclick="window.ElkhetaAcademicAssistant.revealEssayRubric()" style="padding:10px; background:var(--ast-gold-grad); color:#FFF; border:none; border-radius:10px; font-weight:800; cursor:pointer;">
                                <i class="fa-solid fa-list-check"></i> عرض سلم التصحيح والحل النموذجي
                            </button>
                            <div id="elkEssayRubricView" style="display:none; flex-direction:column; gap:8px;"></div>
                        </div>
                    `;
                    break;

                // 14. حل المسألة والتطبيق خطوة بخطوة
                case 'step_by_step':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:var(--ast-surface); border:1.5px solid var(--ast-border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                <div style="font-size:13.5px; font-weight:900; color:var(--ast-gold);">🎯 الحالة التطبيقية / المسألة:</div>
                                <div style="font-size:12.5px; color:var(--ast-text-title); line-height:1.6;">${data.stepByStep.scenario}</div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.stepByStep.steps.map((st, i) => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 14px; display:flex; align-items:flex-start; gap:10px;">
                                        <span style="width:24px; height:24px; border-radius:50%; background:var(--ast-gold-light); color:var(--ast-gold); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; flex-shrink:0;">${i + 1}</span>
                                        <div>
                                            <div style="font-size:12.5px; font-weight:800; color:var(--ast-text-title);">${st.name}</div>
                                            <div style="font-size:11.5px; color:var(--ast-text-body); margin-top:2px; line-height:1.5;">${st.desc}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 15. اسأل عن دقيقة محددة
                case 'timestamp_query':
                    toolContentHtml = `
                        <div style="font-size:12px; color:var(--ast-text-muted); margin-bottom:4px;">
                            ⏱️ انقر على أي توقيت أدناه ليقفز مشغل الفيديو فوراً إلى دقيقة الشرح المباشرة:
                        </div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${data.timestamps.map(ts => `
                                <div class="elk-timestamp-item" onclick="window.ElkhetaAcademicAssistant.seekToVideoTime(${ts.seconds})">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <i class="fa-solid fa-circle-play" style="color:var(--ast-gold); font-size:16px;"></i>
                                        <div>
                                            <div style="font-size:12.5px; font-weight:800; color:var(--ast-text-title);">${ts.topic}</div>
                                            <div style="font-size:11px; color:var(--ast-text-muted);">${ts.summary}</div>
                                        </div>
                                    </div>
                                    <span class="elk-ts-badge">${ts.timeText}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 16. حدد نقطة ضعفي (كويز تشخيصي مع قفز تلقائي للفيديو)
                case 'weakness_finder':
                    toolContentHtml = `
                        <div style="font-size:12px; color:var(--ast-text-muted); margin-bottom:6px;">
                            🎯 أجب على هذا السؤال التشخيصي السريع؛ إذا أخطأت سنحدد نقطة الضعف ونقفز فوراً لدقيقة الشرح:
                        </div>
                        <div style="background:var(--ast-surface); border:1.5px solid var(--ast-border); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:10px;">
                            <div style="font-size:13.5px; font-weight:900; color:var(--ast-text-title); line-height:1.5;">
                                ${data.weaknessQuiz.q}
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                ${data.weaknessQuiz.options.map(opt => `
                                    <button type="button" onclick="window.ElkhetaAcademicAssistant.handleWeaknessAnswer(${opt.isCorrect}, ${data.weaknessQuiz.timestampSec}, '${opt.diagText}')" style="padding:10px 14px; text-align:right; border-radius:10px; border:1px solid var(--ast-border); background:var(--ast-surface-soft); font-size:12.5px; font-weight:800; cursor:pointer; color:inherit; font-family:inherit; transition:all 0.2s;">
                                        ${opt.text}
                                    </button>
                                `).join('')}
                            </div>
                            <div id="elkWeaknessDiagResult" style="display:none;"></div>
                        </div>
                    `;
                    break;

                // 17. اشرحها لي بالعامية (Feynman)
                case 'feynman_simple':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:linear-gradient(135deg, #ECFDF5, #F0FDF4); border:1.5px solid #A7F3D0; border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                <div style="font-size:14px; font-weight:900; color:#065F46;">
                                    🗣️ فك التعقيد بمبدأ فاينمان (بالمصري الدارج):
                                </div>
                                <div style="font-size:12.5px; color:#047857; line-height:1.7;">
                                    ${data.feynmanExplanation}
                                </div>
                            </div>
                            <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; font-size:12px; color:var(--ast-text-muted); line-height:1.6;">
                                💡 <em>الفكرة:</em> لما تفهم المفهوم بالمثال البلدي، تقدر تصيغه في الامتحان باللغة الأكاديمية الرسمية من غير ما تحفظ كلمة بكلمة وتنسى!
                            </div>
                        </div>
                    `;
                    break;

                // 18. المتطلبات السابقة والتراكمي
                case 'prerequisites':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <div style="font-size:12px; color:var(--ast-text-muted);">
                                🔗 مفاهيم ومعارف سابقة لازم تكون في ذهنك عشان تفهم المحاضرة دي بسهولة:
                            </div>
                            ${data.prerequisites.map(p => `
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px;">
                                    <div style="font-size:13px; font-weight:800; color:var(--ast-text-title);">🔹 ${p.concept}</div>
                                    <div style="font-size:11.5px; color:var(--ast-text-body); line-height:1.5;">${p.howItConnects}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 19. استنتج القانون والمفهوم
                case 'derivation':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="font-size:12px; color:var(--ast-text-muted);">
                                💡 إزاي العلماء وصلوا للمفهوم ده خطوة بخطوة من البدايات:
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.derivation.map((step, idx) => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 14px; display:flex; flex-direction:column; gap:4px;">
                                        <div style="font-size:12.5px; font-weight:900; color:var(--ast-gold);">خطوة ${idx + 1}: ${step.heading}</div>
                                        <div style="font-size:12px; color:var(--ast-text-body); line-height:1.5;">${step.explanation}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 20. خطة مذاكرة ومؤقت بومودورو
                case 'study_planner':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:14px;">
                            <!-- Pomodoro Widget -->
                            <div style="background:linear-gradient(135deg, #1E293B, #0F172A); border-radius:16px; padding:16px; color:#FFF; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; border:1px solid rgba(212,151,59,0.3);">
                                <div style="font-size:12px; color:#F0B855; font-weight:800;">⏱️ مؤقت بومودورو للمذاكرة المركزة</div>
                                <div style="font-size:32px; font-weight:900; font-family:monospace; letter-spacing:2px;" id="elkPomoDigits">25:00</div>
                                <div style="display:flex; gap:10px; margin-top:4px;">
                                    <button type="button" id="elkBtnPomoStart" onclick="window.ElkhetaAcademicAssistant.togglePomodoro()" style="padding:6px 16px; border-radius:20px; background:var(--ast-gold-grad); color:#FFF; border:none; font-weight:800; cursor:pointer;">
                                        <i class="fa-solid fa-play"></i> بدء التركيز
                                    </button>
                                    <button type="button" onclick="window.ElkhetaAcademicAssistant.resetPomodoro()" style="padding:6px 14px; border-radius:20px; background:rgba(255,255,255,0.12); color:#FFF; border:none; font-size:12px; cursor:pointer;">
                                        إعادة ضبط
                                    </button>
                                </div>
                            </div>

                            <!-- Plan Breakdown -->
                            <div style="font-size:12.5px; font-weight:800; color:var(--ast-text-title);">📅 تقسيم الوقت المقترح لدراسة الفصل:</div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; font-size:12px;">
                                    <span>🎥 1. مشاهدة الفيديو وتدوين الملاحظات</span>
                                    <strong style="color:var(--ast-gold);">30 دقيقة</strong>
                                </div>
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; font-size:12px;">
                                    <span>📑 2. قراءة كبسولة الـ PDF والملخص</span>
                                    <strong style="color:var(--ast-gold);">15 دقيقة</strong>
                                </div>
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; font-size:12px;">
                                    <span>🗂️ 3. تثبيت المفاهيم ببطاقات Flashcards</span>
                                    <strong style="color:var(--ast-gold);">10 دقائق</strong>
                                </div>
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; font-size:12px;">
                                    <span>📝 4. حل كويز المحاضرة ومراجعة الأخطاء</span>
                                    <strong style="color:var(--ast-gold);">20 دقيقة</strong>
                            </div>
                        </div>
                    `;
                    break;

                // 21. رادار الكلمات المفتاحية بالأسئلة (Keywords Scanner)
                case 'keywords_scanner':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:var(--ast-gold-light); border:1px solid var(--ast-gold-border); border-radius:12px; padding:12px; font-size:12px; color:var(--ast-gold-text); line-height:1.6;">
                                🎯 <strong>رادار الأسئلة:</strong> هذه الكلمات إذا ظهرت في رأس السؤال تقلب الإجابة من صح إلى خطأ أو العكس. ركز فيها جيداً!
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.keywordsScanner.map(kw => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px;">
                                        <div style="font-size:13px; font-weight:900; color:#EF4444; display:flex; align-items:center; gap:6px;">
                                            <i class="fa-solid fa-crosshairs"></i>
                                            <span>الكلمة التوجيهية: « ${kw.word} »</span>
                                        </div>
                                        <div style="font-size:12px; color:var(--ast-text-body); line-height:1.6;">${kw.rule}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 22. كاشف صيغ صح وخطأ الخادعة (True/False Detector)
                case 'true_false_detector':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="font-size:12px; color:var(--ast-text-muted);">
                                🔍 أشهر الحيل والصيغ الخادعة التي يضعها أساتذة المادة في أسئلة (صح أو خطأ):
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${data.trueFalseDetector.map(tf => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;">
                                        <div style="font-size:13px; font-weight:900; color:var(--ast-gold);">${tf.pattern}</div>
                                        <div style="font-size:12px; color:var(--ast-text-body); line-height:1.5;">${tf.analysis}</div>
                                        <div style="background:rgba(239, 68, 68, 0.08); border-right:3px solid #EF4444; padding:8px 12px; border-radius:0 8px 8px 0; font-size:12px; color:#DC2626;">
                                            <strong>مثال امتحاني:</strong> ${tf.sample}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 23. ورقة مراجعة ليلة الامتحان (Cheat Sheet)
                case 'cheat_sheet':
                    toolContentHtml = `
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <span style="font-size:12px; font-weight:800; color:var(--ast-gold);">⚡ كبسولة سريعة للإنقاذ في 5 دقائق</span>
                            <button type="button" onclick="window.print()" style="padding:6px 12px; background:var(--ast-gold-grad); color:#FFF; border:none; border-radius:8px; font-size:11.5px; font-weight:800; cursor:pointer;">
                                <i class="fa-solid fa-print"></i> طباعة Cheat Sheet
                            </button>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${data.cheatSheet.sections.map(sec => `
                                <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px;">
                                    <div style="font-size:13px; font-weight:900; color:var(--ast-gold); margin-bottom:6px;">${sec.hd}</div>
                                    <ul style="margin:0; padding-right:18px; font-size:12px; color:var(--ast-text-body); line-height:1.6;">
                                        ${sec.pts.map(pt => `<li>${pt}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                // 24. تحدي السرعة 60 ثانية (Speed Drill)
                case 'speed_drill':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:linear-gradient(135deg, #F97316, #EA580C); color:#FFF; border-radius:12px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between;">
                                <div>
                                    <div style="font-size:13.5px; font-weight:900;">⚡ تحدي السرعة الخاطف</div>
                                    <div style="font-size:11.5px; opacity:0.9;">أجب فوراً بدون تفكير طويل لقياس سرعة الاستدعاء</div>
                                </div>
                                <div style="font-size:18px; font-weight:900; font-family:monospace;" id="speedDrillScoreBadge">0 / ${data.speedDrill.length}</div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px;" id="speedDrillQuestionsWrap">
                                ${data.speedDrill.map((sd, qIdx) => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;" id="drillCard_${qIdx}">
                                        <div style="font-size:13px; font-weight:800; color:var(--ast-text-title);">سؤال ${qIdx + 1}: ${sd.q}</div>
                                        <div style="display:grid; grid-template-columns:1fr; gap:6px;">
                                            ${sd.opts.map((opt, optIdx) => `
                                                <button type="button" class="elk-drill-btn" onclick="window.ElkhetaAcademicAssistant.answerSpeedDrill(${qIdx}, ${optIdx})" style="text-align:right; padding:8px 12px; border-radius:8px; border:1px solid var(--ast-border); background:var(--ast-surface-soft); color:var(--ast-text-body); font-size:12px; cursor:pointer; transition:all 0.2s; font-family:inherit;">
                                                    ${opt}
                                                </button>
                                            `).join('')}
                                        </div>
                                        <div style="display:none; font-size:11.5px; padding:6px 10px; border-radius:6px; line-height:1.4;" id="drillFeedback_${qIdx}"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 25. ثلاثية الفهم: ماذا ولماذا وكيف؟ (Why-How-What)
                case 'why_how_what':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="font-size:12px; color:var(--ast-text-muted);">
                                💡 مصفوفة الفهم العميق: تفكيك المفاهيم المعقدة إلى ثلاثة أبعاد لا تنسى:
                            </div>
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                ${data.whyHowWhat.map(m => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                        <div style="font-size:14px; font-weight:900; color:var(--ast-gold); border-bottom:1px solid var(--ast-border); padding-bottom:6px;">
                                            🎯 ${m.concept}
                                        </div>
                                        <div style="display:grid; grid-template-columns:1fr; gap:6px; font-size:12px;">
                                            <div style="background:rgba(59, 130, 246, 0.08); border-right:3px solid #3B82F6; padding:8px 10px; border-radius:0 8px 8px 0; color:var(--ast-text-body);">
                                                <strong style="color:#2563EB;">1️⃣ ${m.what.slice(0, 7)}</strong> ${m.what.slice(7)}
                                            </div>
                                            <div style="background:rgba(16, 185, 129, 0.08); border-right:3px solid #10B981; padding:8px 10px; border-radius:0 8px 8px 0; color:var(--ast-text-body);">
                                                <strong style="color:#059669;">2️⃣ ${m.why.slice(0, 8)}</strong> ${m.why.slice(8)}
                                            </div>
                                            <div style="background:rgba(212, 151, 59, 0.08); border-right:3px solid #D4973B; padding:8px 10px; border-radius:0 8px 8px 0; color:var(--ast-text-body);">
                                                <strong style="color:#D4973B;">3️⃣ ${m.how.slice(0, 11)}</strong> ${m.how.slice(11)}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 26. دراسة حالة ميدانية واقعية (Case Study)
                case 'case_study':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                <div style="font-size:14px; font-weight:900; color:var(--ast-gold);">
                                    📋 ${data.caseStudy.title}
                                </div>
                                <div style="font-size:12.5px; color:var(--ast-text-body); line-height:1.7; background:var(--ast-surface-soft); padding:10px 12px; border-radius:10px; border:1px solid var(--ast-border);">
                                    ${data.caseStudy.situation}
                                </div>
                                <div style="font-size:12.5px; font-weight:800; color:#EF4444; margin-top:4px;">
                                    ⚖️ المعضلة المهنية: ${data.caseStudy.dilemma}
                                </div>
                                <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
                                    ${data.caseStudy.options.map((opt, i) => `
                                        <button type="button" onclick="document.querySelectorAll('.cs-fdb').forEach(el=>el.style.display='none'); document.getElementById('csFeedback_${i}').style.display='block';" style="text-align:right; padding:10px 12px; border-radius:10px; border:1px solid var(--ast-border); background:var(--ast-surface); color:var(--ast-text-body); font-size:12px; cursor:pointer; font-family:inherit; transition:all 0.2s;">
                                            <strong>${opt.letter})</strong> ${opt.text}
                                        </button>
                                        <div id="csFeedback_${i}" class="cs-fdb" style="display:none; font-size:11.5px; padding:8px 12px; border-radius:8px; line-height:1.5; background:${opt.isCorrect ? '#ECFDF5' : '#FEF2F2'}; color:${opt.isCorrect ? '#065F46' : '#991B1B'}; border:1px solid ${opt.isCorrect ? '#A7F3D0' : '#FECACA'};">
                                            ${opt.feedback}
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="background:rgba(212, 151, 59, 0.1); border-right:3px solid var(--ast-gold); padding:10px 12px; border-radius:0 10px 10px 0; font-size:12px; color:var(--ast-gold-text); line-height:1.6; margin-top:6px;">
                                    <strong>💡 الدرس المستفاد للأخصائي:</strong> ${data.caseStudy.lessonLearned}
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                // 27. بنك أسئلة الشفوي والمناقشات (Oral Exam)
                case 'oral_exam':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="font-size:12px; color:var(--ast-text-muted);">
                                🎓 أسئلة شائعة في امتحان الشفوي ومناقشة أساتذة المادة مع طريقة الإجابة الاحترافية:
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${data.oralExam.map((item, idx) => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;">
                                        <div style="font-size:13px; font-weight:800; color:#2563EB; display:flex; gap:6px;">
                                            <span>س ${idx + 1}:</span>
                                            <span>${item.q}</span>
                                        </div>
                                        <div style="background:rgba(16, 185, 129, 0.08); border-right:3px solid #10B981; padding:10px 12px; border-radius:0 8px 8px 0; font-size:12px; color:var(--ast-text-body); line-height:1.6;">
                                            <strong style="color:#059669;">الصياغة الاحترافية للإجابة:</strong><br>
                                            ${item.ans}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 28. سؤال التفكير النقدي والمستويات العليا (Critical Thinking)
                case 'critical_thinking':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                                <div style="font-size:14px; font-weight:900; color:var(--ast-gold);">
                                    🧠 موقف تحليلي نقدي (مستويات عليا - بلوم)
                                </div>
                                <div style="font-size:12.5px; color:var(--ast-text-body); line-height:1.7; background:var(--ast-surface-soft); padding:10px 12px; border-radius:10px; border:1px solid var(--ast-border);">
                                    ${data.criticalThinking.scenario}
                                </div>
                                <div style="font-size:12.5px; font-weight:800; color:#7C3AED;">
                                    📌 المطلوب: ${data.criticalThinking.prompt}
                                </div>
                                <div style="background:rgba(124, 58, 237, 0.06); border-right:3px solid #7C3AED; padding:10px 14px; border-radius:0 10px 10px 0; font-size:12px; color:var(--ast-text-body); line-height:1.7; margin-top:4px;">
                                    <strong style="color:#7C3AED;">محاور التحليل العلمي الرصين:</strong><br>
                                    ${data.criticalThinking.analysisPoints.map(p => `• ${p}<br>`).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                // 29. قائمة التحقق قبل الامتحان (Revision Checklist)
                case 'revision_checklist':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <!-- Progress Bar -->
                            <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; font-weight:800;">
                                    <span>مستوى الجاهزية لدخول الامتحان:</span>
                                    <span style="color:var(--ast-gold);" id="chkProgressText">0% (0 من ${data.revisionChecklist.length})</span>
                                </div>
                                <div style="height:8px; border-radius:4px; background:var(--ast-surface-soft); overflow:hidden;">
                                    <div id="chkProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #10B981, #059669); transition:width 0.3s ease;"></div>
                                </div>
                            </div>

                            <!-- Items -->
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.revisionChecklist.map((it, i) => `
                                    <label style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-size:12px; color:var(--ast-text-body); line-height:1.5;">
                                        <input type="checkbox" class="elk-chk-box" onchange="window.ElkhetaAcademicAssistant.toggleChecklistItem()" style="margin-top:3px; accent-color:#10B981; width:16px; height:16px; cursor:pointer;">
                                        <span>${it.text}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                // 30. مستشار الاستفسار الفوري الذكي (Ask Tutor)
                case 'ask_tutor':
                    toolContentHtml = `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="background:linear-gradient(135deg, #2563EB, #1D4ED8); color:#FFF; border-radius:12px; padding:12px 14px;">
                                <div style="font-size:13.5px; font-weight:900;">💬 مستشارك الأكاديمي الذكي الفوري</div>
                                <div style="font-size:11.5px; opacity:0.9;">${data.askTutor.intro}</div>
                            </div>
                            
                            <!-- Search / Query Box -->
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="elkAskTutorInput" placeholder="اكتب سؤالك أو استفسارك هنا..." style="flex:1; padding:10px 12px; border-radius:10px; border:1px solid var(--ast-border); background:var(--ast-surface); color:var(--ast-text-title); font-size:12.5px; font-family:inherit; outline:none;">
                                <button type="button" onclick="window.ElkhetaAcademicAssistant.askTutorQuery()" style="padding:10px 16px; border-radius:10px; background:var(--ast-gold-grad); color:#FFF; border:none; font-weight:800; cursor:pointer; font-size:12px; white-space:nowrap;">
                                    إرسال
                                </button>
                            </div>
                            <div id="elkAskTutorAnswerBox" style="display:none; background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:12px; padding:12px; font-size:12px; line-height:1.6;"></div>

                            <!-- FAQ List -->
                            <div style="font-size:12px; font-weight:800; color:var(--ast-gold); margin-top:4px;">
                                💡 أكثر الأسئلة شيوعاً وإجاباتها الفورية:
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${data.askTutor.faq.map(f => `
                                    <div style="background:var(--ast-surface); border:1px solid var(--ast-border); border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:4px;">
                                        <div style="font-size:12.5px; font-weight:800; color:var(--ast-text-title);">❓ ${f.q}</div>
                                        <div style="font-size:11.5px; color:#059669; line-height:1.5;">💡 ${f.a}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                default:
                    toolContentHtml = `<div style="padding:20px; text-align:center;">جاري تجهيز الأداة...</div>`;
            }

            body.innerHTML = `
                <div class="elk-tool-view-container">
                    <div class="elk-tool-view-nav">
                        <button type="button" class="elk-btn-back-tools" onclick="window.ElkhetaAcademicAssistant.renderCategoryTools(${toolInfo.cat || 1})">
                            <i class="fa-solid fa-arrow-right"></i>
                            <span>العودة لقائمة الأدوات</span>
                        </button>
                        <div style="font-size:13px; font-weight:900; color:var(--ast-gold); display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid ${toolInfo.icon}"></i>
                            <span>${toolInfo.title}</span>
                        </div>
                    </div>
                    ${toolContentHtml}
                </div>
            `;
        }

        /* ─── FLASHCARD CONTROLLER ─── */
        nextFlashcard(known) {
            const data = this.getCurriculumData();
            const total = data.flashcards.length;
            if (known) this.fcMastered++;
            else this.fcReview++;

            this.currentFcIndex++;
            if (this.currentFcIndex >= total) {
                // Done all cards
                const stage = document.getElementById('elkFcStage');
                if (stage) {
                    stage.innerHTML = `
                        <div style="background:linear-gradient(135deg, #10B981, #059669); color:#FFF; border-radius:16px; padding:20px; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:8px;">
                            <i class="fa-solid fa-award" style="font-size:36px; color:#FDE68A;"></i>
                            <div style="font-size:16px; font-weight:900;">أحسنت يا بطل! أتممت جميع البطاقات</div>
                            <div style="font-size:13px;">المتقنة: ${this.fcMastered} | بحاجة لمراجعة: ${this.fcReview}</div>
                            <button onclick="window.ElkhetaAcademicAssistant.openTool('flashcards')" style="margin-top:6px; padding:6px 14px; background:#FFF; color:#059669; border:none; border-radius:20px; font-weight:800; cursor:pointer;">إعادة المحاولة 🔁</button>
                        </div>
                    `;
                }
                return;
            }

            // Next card
            const stage = document.getElementById('elkFcStage');
            if (stage) stage.classList.remove('flipped');

            setTimeout(() => {
                const fc = data.flashcards[this.currentFcIndex];
                const qEl = document.getElementById('fcFrontText');
                const aEl = document.getElementById('fcBackText');
                const cEl = document.getElementById('fcCounterText');
                const mEl = document.getElementById('fcMasteredNum');
                if (qEl) qEl.textContent = fc.q;
                if (aEl) aEl.textContent = fc.a;
                if (cEl) cEl.textContent = `بطاقة ${this.currentFcIndex + 1} من ${total}`;
                if (mEl) mEl.textContent = this.fcMastered;
            }, 250);
        }

        /* ─── SAFE AUDIO CLEANUP HELPER ─── */
        stopPodcastAudio() {
            if (this.audioElement && this.audioPlaying) {
                this.audioElement.pause();
                this.audioPlaying = false;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }

        /* ─── RECITATION EVALUATOR ─── */
        evaluateRecitation() {
            const input = document.getElementById('elkReciteInput');
            const feedback = document.getElementById('elkReciteFeedback');
            if (!input || !feedback) return;

            const text = (input.value || '').trim().toLowerCase();
            if (!text) {
                alert('من فضلك اكتب بعض النقاط أولاً!');
                return;
            }

            const data = this.getCurriculumData();
            const keywords = data.recitePrompt.keywords || [];
            let matched = [];
            let missing = [];

            keywords.forEach(kw => {
                if (text.includes(kw.toLowerCase())) matched.push(kw);
                else missing.push(kw);
            });

            const score = Math.round((matched.length / keywords.length) * 100);

            feedback.style.display = 'flex';
            feedback.className = 'elk-recite-result';
            feedback.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:13px; font-weight:900; color:${score >= 70 ? '#059669' : '#DC2626'};">
                        ${score >= 70 ? '🎉 تسميع ممتاز ومركّز!' : '⚠️ بحاجة لتدعيم الكلمات المفتاحية'}
                    </span>
                    <span style="font-size:13px; font-weight:900;">نسبة الإتقان: ${score}%</span>
                </div>
                <div style="font-size:11.5px; margin-top:4px;">
                    ✅ <strong>الكلمات المفتاحية المذكورة:</strong> ${matched.length ? matched.join(' • ') : 'لا يوجد'}
                </div>
                ${missing.length ? `
                    <div style="font-size:11.5px; color:#DC2626; margin-top:2px;">
                        ❌ <strong>نقاط مهمة غابت عن تسميعك:</strong> ${missing.join(' • ')}
                    </div>
                ` : ''}
            `;
        }

        /* ─── ESSAY RUBRIC REVEAL ─── */
        revealEssayRubric() {
            const rubEl = document.getElementById('elkEssayRubricView');
            if (!rubEl) return;
            const data = this.getCurriculumData();

            rubEl.style.display = 'flex';
            rubEl.innerHTML = `
                <div style="background:var(--ast-gold-light); border:1px solid var(--ast-gold-border); border-radius:10px; padding:12px; font-size:12px; color:var(--ast-gold-text); line-height:1.6;">
                    <strong>سلم التصحيح النموذجي (عناصر الإجابة المطلوبة):</strong><br>
                    ${data.essayQuestion.rubricPoints.map((pt, i) => `🔹 ${i + 1}. ${pt}<br>`).join('')}
                    <div style="margin-top:6px; font-size:11.5px; color:#059669; font-weight:800;">
                        💡 نصيحة المصحح: قسّم إجابتك دائماً إلى: مقدمة مفهوم، نقاط مرقمة مدعومة بأمثلة، وخاتمة مهنية.
                    </div>
                </div>
            `;
        }

        /* ─── WEAKNESS DIAGNOSIS QUIZ HANDLER ─── */
        handleWeaknessAnswer(isCorrect, timestampSec, diagText) {
            const res = document.getElementById('elkWeaknessDiagResult');
            if (!res) return;

            res.style.display = 'block';
            if (isCorrect) {
                res.innerHTML = `
                    <div style="background:var(--ast-green-light); border:1px solid #10B981; border-radius:10px; padding:12px; font-size:12.5px; color:#059669; line-height:1.6; margin-top:8px;">
                        🎉 <strong>إجابة صحيحة 100%!</strong> استيعابك لهذه الجزئية دقيق جداً ولا يوجد أي لبس مفاهيمي.
                    </div>
                `;
            } else {
                res.innerHTML = `
                    <div style="background:var(--ast-red-light); border:1px solid #EF4444; border-radius:10px; padding:12px; font-size:12.5px; color:#DC2626; line-height:1.6; margin-top:8px;">
                        ❌ <strong>تشخيص الخطأ:</strong> ${diagText}<br>
                        <button type="button" onclick="window.ElkhetaAcademicAssistant.seekToVideoTime(${timestampSec})" style="margin-top:8px; display:inline-flex; align-items:center; gap:6px; padding:8px 14px; background:#DC2626; color:#FFF; border:none; border-radius:8px; font-weight:800; font-size:12px; cursor:pointer;">
                            <i class="fa-solid fa-play"></i> قفز فوري لدقيقة الشرح في الفيديو (${Math.floor(timestampSec/60)}:${(timestampSec%60).toString().padStart(2, '0')})
                        </button>
                    </div>
                `;
            }
        }

        /* ─── POMODORO TIMER ENGINE ─── */
        togglePomodoro() {
            const btn = document.getElementById('elkBtnPomoStart');
            if (this.pomodoroRunning) {
                clearInterval(this.pomodoroTimer);
                this.pomodoroRunning = false;
                if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> استئناف التركيز';
            } else {
                this.pomodoroRunning = true;
                if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> إيقاف مؤقت';
                this.pomodoroTimer = setInterval(() => {
                    this.pomodoroSecondsLeft--;
                    this.updatePomodoroDisplay();
                    if (this.pomodoroSecondsLeft <= 0) {
                        clearInterval(this.pomodoroTimer);
                        this.pomodoroRunning = false;
                        alert('🔔 انتهت جلسة التركيز (25 دقيقة)! حان وقت استراحة 5 دقائق لتجديد النشاط.');
                        this.resetPomodoro();
                    }
                }, 1000);
            }
        }

        resetPomodoro() {
            clearInterval(this.pomodoroTimer);
            this.pomodoroRunning = false;
            this.pomodoroSecondsLeft = 25 * 60;
            this.updatePomodoroDisplay();
            const btn = document.getElementById('elkBtnPomoStart');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> بدء التركيز';
        }

        updatePomodoroDisplay() {
            const el = document.getElementById('elkPomoDigits');
            if (!el) return;
            const m = Math.floor(this.pomodoroSecondsLeft / 60);
            const s = this.pomodoroSecondsLeft % 60;
            el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        /* ─── SPEED DRILL CONTROLLER ─── */
        answerSpeedDrill(qIdx, optIdx) {
            const data = this.getCurriculumData();
            const q = data.speedDrill[qIdx];
            if (!q) return;

            const card = document.getElementById(`drillCard_${qIdx}`);
            const fb = document.getElementById(`drillFeedback_${qIdx}`);
            if (!card || !fb) return;

            const isCorrect = (optIdx === q.ans);
            const btns = card.querySelectorAll('.elk-drill-btn');
            btns.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === q.ans) {
                    btn.style.background = '#10B981';
                    btn.style.color = '#FFFFFF';
                    btn.style.borderColor = '#059669';
                } else if (idx === optIdx && !isCorrect) {
                    btn.style.background = '#EF4444';
                    btn.style.color = '#FFFFFF';
                    btn.style.borderColor = '#DC2626';
                }
            });

            fb.style.display = 'block';
            fb.style.background = isCorrect ? '#ECFDF5' : '#FEF2F2';
            fb.style.color = isCorrect ? '#065F46' : '#991B1B';
            fb.style.border = `1px solid ${isCorrect ? '#A7F3D0' : '#FECACA'}`;
            fb.innerHTML = `<strong>${isCorrect ? '✅ إجابة سريعة ممتازة!' : '❌ إجابة خاطئة!'}</strong> ${q.why}`;

            // Update badge score
            if (!this.speedScores) this.speedScores = {};
            this.speedScores[qIdx] = isCorrect ? 1 : 0;
            const totalScore = Object.values(this.speedScores).reduce((a, b) => a + b, 0);
            const badge = document.getElementById('speedDrillScoreBadge');
            if (badge) badge.textContent = `${totalScore} / ${data.speedDrill.length}`;
        }

        /* ─── CHECKLIST TOGGLE HELPER ─── */
        toggleChecklistItem() {
            const boxes = document.querySelectorAll('.elk-chk-box');
            if (!boxes.length) return;
            let checked = 0;
            boxes.forEach(b => { if (b.checked) checked++; });
            const pct = Math.round((checked / boxes.length) * 100);
            const txt = document.getElementById('chkProgressText');
            const bar = document.getElementById('chkProgressBar');
            if (txt) txt.textContent = `${pct}% (${checked} من ${boxes.length})`;
            if (bar) bar.style.width = `${pct}%`;
        }

        /* ─── ASK TUTOR INSTANT CONSULTANT ─── */
        askTutorQuery() {
            const input = document.getElementById('elkAskTutorInput');
            const ansBox = document.getElementById('elkAskTutorAnswerBox');
            if (!input || !ansBox) return;

            const q = (input.value || '').trim().toLowerCase();
            if (!q) {
                alert('من فضلك اكتب سؤالك أولاً!');
                return;
            }

            ansBox.style.display = 'block';
            ansBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري البحث واستحضار الإجابة النموذجية من المقرر...`;

            setTimeout(() => {
                const data = this.getCurriculumData();
                let answer = '';

                if (q.includes('ليونبرج') || q.includes('تكيف') || q.includes('وظي')) {
                    answer = 'وفق تصنيف ليونبرج: المهارات التكيفية (Adaptive) تمكن الأخصائي من الانسجام مع بيئة ولوائح المؤسسة، بينما المهارات الوظيفية (Functional) تختص بحل المشكلات وصنع القرار والتحليل والتعامل مع الأشخاص.';
                } else if (q.includes('طومسون') || q.includes('شرط') || q.includes('شروط')) {
                    answer = 'حدد نيل طومسون 6 شروط لتنمية المهارات: 1) مردود الممارسة، 2) استعداد الممارس ذاتياً للتغيير، 3) الثقة بالنفس، 4) التعلم من الزملاء، 5) الاستفادة من الإشراف، 6) التعليم المستمر.';
                } else if (q.includes('عام') || q.includes('خاص') || q.includes('جامع') || q.includes('تدريب')) {
                    answer = 'المهارات العامة تكتسب من الدراسة الأكاديمية التأسيسية بالجامعة (كالمقابلة وبناء العلاقة والتقدير)، أما المهارات الخاصة فتكتسب حصراً ببرامج التدريب أثناء العمل (On-the-job training).';
                } else if (q.includes('سر') || q.includes('أمان')) {
                    answer = 'السرية في الخدمة الاجتماعية مبدأ نسبي ومقيد وليس مطلقاً، حيث يلزم الإفصاح القانوني والأخلاقي عند وجود خطر يهدد حياة العميل أو الغير أو الأطفال.';
                } else if (q.includes('محدد') || q.includes('نسب')) {
                    answer = 'ممارسة المهارة نسبية محكومة بـ 4 محددات: طريقة الممارسة (أفراد/جماعات)، مدخل التدخل، نوع المؤسسة وبيئتها، والفترة الزمنية المتاحة.';
                } else {
                    answer = 'إجابة المستشار الأكاديمي: المهارة في الخدمة الاجتماعية تعني إنجاز العمل الفكري أو الميداني بأقل جهد وتكلفة وأسرع وقت وأعلى دقة وعائد، وتنقسم إلى مهارات عامة (بالجامعة) وخاصة (بالتدريب أثناء العمل)، وممارستها نسبية ومحكومة بظروف المؤسسة والزمن.';
                }

                ansBox.innerHTML = `
                    <div style="font-weight:900; color:#2563EB; margin-bottom:4px; font-size:13px;">💡 إجابة مستشارك الأكاديمي:</div>
                    <div style="color:var(--ast-text-body); line-height:1.6;">${answer}</div>
                `;
            }, 300);
        }

        /* ─── CURRICULUM DATA GENERATOR (Authentic Syllabus & Lecture Aware) ─── */
        getCurriculumData() {
            const lec = this.activeLecture || {};
            const title = (lec.title || 'الفصل الاول المهارات المهنية').trim();
            const subj = (lec.subjectName || lec.subjectKey || 'طريقة العمل مع الأفراد').trim();
            const chap = (lec.chapter || 'الفصل الأول').trim();
            const rawQuestions = Array.isArray(lec.questions) ? lec.questions : [];

            const isSkillsChapter = title.includes('مهار') || title.includes('المهارات') || chap.includes('المهارات') || title.includes('الاول') || title.includes('الأول');

            // ════ Dynamic Flashcards extracted directly from the Lecture's 50 real exam questions ════
            let realFlashcards = [];
            let realPredictions = [];

            if (rawQuestions.length > 0) {
                realFlashcards = rawQuestions.slice(0, 10).map(q => {
                    const corrIdx = (q.correctAnswerIndex !== undefined) ? q.correctAnswerIndex : ((q.correct !== undefined) ? q.correct : 0);
                    const optText = (q.options && q.options[corrIdx]) ? q.options[corrIdx] : 'الإجابة النموذجية المعتمدة';
                    const explText = q.explanation ? ` (${q.explanation})` : '';
                    return {
                        q: q.q || q.text || 'سؤال في المهارات المهنية',
                        a: optText + explText
                    };
                });

                realPredictions = rawQuestions.slice(0, 10).map((q, idx) => {
                    const corrIdx = (q.correctAnswerIndex !== undefined) ? q.correctAnswerIndex : ((q.correct !== undefined) ? q.correct : 0);
                    const optText = (q.options && q.options[corrIdx]) ? q.options[corrIdx] : 'الإجابة الصحيحة';
                    return {
                        q: q.q || q.text || `سؤال متوقع ${idx + 1}`,
                        probability: 98 - (idx * 2),
                        modelAnswer: `${optText}. ${q.explanation || ''}`.trim()
                    };
                });
            } else {
                realFlashcards = [
                    { q: 'ما هو الأصل اللغوي لمصطلح (المهارة) في اللغة العربية؟', a: 'مشتقة من الفعل (مَهُرَ بالشيء)؛ أي أحكمه وأتقنه وصار به حاذقاً وعليماً به.' },
                    { q: 'ماذا تعني كلمة (Skill) بالإنجليزية في سياق الممارسة الاجتماعية؟', a: 'تعني البراعة أو تقديم الخدمة بجودة وإتقان.' },
                    { q: 'كيف تتحقق المهارة وفق المفهوم الإجرائي والاقتصادي المتكامل؟', a: 'عندما يؤدي الممارس العمل بأقل جهد، وأقل تكلفة، وأسرع وقت، وأعلى دقة وعائد ممكن.' },
                    { q: 'إلى ماذا يصنف العالم (ليونبرج - Leonberg) المهارات الأساسية في خدمة الفرد؟', a: 'إلى نوعين رئيسيين: مهارات تكيفية (Adaptive Skills) ومهارات وظيفية (Functional Skills).' },
                    { q: 'ما هي المهارات التكيفية (Adaptive Skills) عند ليونبرج؟', a: 'هي المهارات التي تُمكّن الأخصائي الاجتماعي من التوافق والانسجام مع البيئة التنظيمية للمؤسسة التي يعمل بها.' },
                    { q: 'ما هي المهارات الوظيفية (Functional Skills) وفق تصنيف ليونبرج؟', a: 'مهارات التعامل مع البيانات وفهم الأشخاص؛ مثل حل المشكلات، صنع القرار، والتحليل والتقييم.' },
                    { q: 'أين وكيف تُكتسب المهارات الخاصة (Specific Skills) على أفضل وجه؟', a: 'من خلال برامج التدريب أثناء العمل (On-the-job training) لأداء وظيفة معينة.' },
                    { q: 'كيف تُكتسب المهارات العامة (كالمقابلة وبناء العلاقة المهنية والتقدير)؟', a: 'تُكتسب عبر الدراسة الأكاديمية التأسيسية في الكليات والمعاهد الجامعية.' },
                    { q: 'كم عدداً حدده (نيل طومسون - Neil Thompson 2000) لشروط تنمية المهارات؟', a: 'ستة شروط متكاملة (مردود الممارسة، استعداد التغيير، الثقة، التعلم من الآخرين، الإشراف، والتعليم المستمر).' },
                    { q: 'ما هي محددات ممارسة المهارة الأربعة في الخدمة الاجتماعية؟', a: 'الطريقة (أفراد/جماعات)، مدخل الممارسة، نوع المؤسسة، والفترة الزمنية المتاحة.' }
                ];

                realPredictions = [
                    { q: 'يصنف العالم (ليونبرج) المهارات الأساسية في ممارسة خدمة الفرد إلى نوعين هما:', probability: 98, modelAnswer: 'مهارات تكيفية (للانسجام مع المؤسسة) ومهارات وظيفية (لحسم المشكلات والتعامل مع الأشخاص).' },
                    { q: 'علل: تعتبر ممارسة المهارة عملية نسبية وغير مطلقة في الخدمة الاجتماعية.', probability: 96, modelAnswer: 'لأنها محكومة بأربعة محددات رئيسية: طريقة الممارسة، مدخل التدخل، طبيعة المؤسسة وبيئتها، والفترة الزمنية المتاحة.' },
                    { q: 'قارن بين المهارات العامة والمهارات الخاصة من حيث مصدر الاكتساب.', probability: 94, modelAnswer: 'المهارات العامة تكتسب بالدراسة الأكاديمية الجامعية، بينما المهارات الخاصة تكتسب بالتدريب أثناء العمل.' },
                    { q: 'اذكر شروط نيل طومسون (Neil Thompson 2000) لتنمية المهارات المهنية.', probability: 92, modelAnswer: 'ستة شروط: تحديد مردود الممارسة، استعداد الممارسين ذاتياً للتغيير، الثقة بالنفس، التعلم من الزملاء، الاستفادة من الإشراف، والتعليم المتواصل.' },
                    { q: 'ما هي أبعاد مهارة تكامل عملية المساعدة وترابطها في خدمة الفرد؟', probability: 90, modelAnswer: 'ثلاثة أبعاد متسلسلة: جمع الحقائق الدراسية، والتفسير (التقدير)، وتحديد اتجاهات العلاج.' }
                ];
            }

            // ════ Specific Syllabus Content for "الفصل الأول: المهارات المهنية" ════
            return {
                confusingTerms: [
                    {
                        term1: 'المهارات التكيفية (Adaptive Skills)',
                        term2: 'المهارات الوظيفية (Functional Skills)',
                        difference: 'التكيفية تمكن الأخصائي من الانسجام مع البيئة التنظيمية للمؤسسة واستيعاب لوائحها، بينما الوظيفية تختص بحل المشكلات وصنع القرار والتحليل والتعامل مع الأشخاص.',
                        trap: 'في الامتحان: ينسب واضع السؤال "صنع القرار وحل المشكلات" للمهارات التكيفية بدلاً من الوظيفية.'
                    },
                    {
                        term1: 'المهارات العامة (General Skills)',
                        term2: 'المهارات الخاصة (Specific Skills)',
                        difference: 'العامة تُكتسب عبر الدراسة الأكاديمية الجامعية (كالمقابلة وبناء العلاقة والتقدير)، والخاصة تُكتسب عبر برامج التدريب أثناء العمل (On-the-job training).',
                        trap: 'السؤال يدعي أن المهارات الخاصة يتعلمها الطالب داخل قاعات المحاضرات الجامعية.'
                    },
                    {
                        term1: 'المهارة لغوياً (مَهُرَ بالشيء)',
                        term2: 'المهارة إجرائياً واقتصادياً',
                        difference: 'لغوياً: الإحكام والإتقان والبراعة، بينما إجرائياً واقتصادياً: إنجاز العمل بأقل جهد وتكلفة وأسرع وقت وأعلى دقة وعائد ممكن.',
                        trap: 'تعريف المهارة إجرائياً بالجهد العضلي البدني الشاق دون مراعاة معايير الدقة والعائد والزمن والتكلفة.'
                    },
                    {
                        term1: 'المهارات القيمية (Values Skills)',
                        term2: 'المهارات المعرفية الفكرية',
                        difference: 'القيمية هي ترجمة قيم وأخلاقيات المهنة لسلوك عملي ملموس وغرسها في نفوس العملاء، بينما المعرفية هي استيعاب النظريات وتفسير الحقائق والبيانات.',
                        trap: 'اعتبار المهارات القيمية مجرد نظريات وشعارات مجردة لا علاقة لها بالسلوك والممارسة الميدانية.'
                    },
                    {
                        term1: 'محدد (طريقة الممارسة)',
                        term2: 'محدد (مدخل الممارسة)',
                        difference: 'الطريقة هي المجال الإجرائي المنظم (أفراد، جماعات، تنظيم مجتمع)، بينما المدخل هو الإطار النظري المعتمد في التدخل (كسلوكي، معرفي، أزمات).',
                        trap: 'الخلط في السؤال بين طريقة خدمة الفرد كطريقة وبين المدخل المعرفي السلوكي كإطار ونموذج نظري.'
                    },
                    {
                        term1: 'محدد (نوع وطبيعة المؤسسة)',
                        term2: 'محدد (الفترة الزمنية المتاحة)',
                        difference: 'المؤسسة تفرض اللوائح ونوعية العملاء (مدرسة، مستشفى، رعاية أحداث)، بينما الزمن يحدد سرعة التدخل المهني ومدته (أزمة طارئة مقابل علاج طويل).',
                        trap: 'الادعاء بأن أخصائي المدرسة يحتاج لنفس سرعة وتقنيات التدخل التي يحتاجها أخصائي طوارئ المستشفيات.'
                    },
                    {
                        term1: 'مهارة الاستماع الواعي (Active Listening)',
                        term2: 'السمع السلبي الفسيولوجي (Passive Hearing)',
                        difference: 'الاستماع الواعي عملية عقلية إرادية تتضمن الانتباه للكلمات ولغة الجسد والمشاعر وتأكيد الفهم، أما السمع فهو التقاط صوتي فسيولوجي غير هادف.',
                        trap: 'اعتبار صمت الأخصائي أثناء المقابلة دليلاً كافياً على ممارسة مهارة الاستماع الفعال والواعي.'
                    },
                    {
                        term1: 'مهارة الملاحظة المنظمة (Systematic Observation)',
                        term2: 'الملاحظة العابرة البسيطة (Casual Observation)',
                        difference: 'المنظمة تستند لأهداف مهنية محددة وأدلة رصد دقيقة ولغة جسد مدروسة، بينما العابرة انطباعات سطحية غير موجهة ولا يعتمد عليها.',
                        trap: 'بناء تقدير مهني وتشخيص للحالة على ملاحظة عابرة غير مقننة وغير موثقة.'
                    },
                    {
                        term1: 'مهارة التقدير والتشخيص (Assessment)',
                        term2: 'جمع الحقائق والدراسة (Study & Fact-Finding)',
                        difference: 'الدراسة هي جمع البيانات والمعلومات الوصفية الخام عن المشكلة، بينما التقدير هو الربط التحليلي وتفسير المعطيات وتحديد نقاط القوة والضعف.',
                        trap: 'الخلط بين مرحلة جمع المعلومات الوصفية وبين مرحلة التحليل والتشخيص المهني الفارق.'
                    },
                    {
                        term1: 'التعاطف المهني (Empathy)',
                        term2: 'العطف والشفقة الشخصية (Sympathy)',
                        difference: 'التعاطف فهم مشاعر العميل من منظوره الخاص مع الحفاظ على الحياد والمسافة المهنية، بينما الشفقة مشاعر انفعالية سلبية تعطل التمكين وتضر العميل.',
                        trap: 'اعتبار البكاء مع العميل أو الشفقة عليه دليلاً على براعة الأخصائي الاجتماعي ونجاح علاقته المهنية.'
                    },
                    {
                        term1: 'مهارة التعاقد المهني (Contracting)',
                        term2: 'الخطة العلاجية الشاملة (Intervention Plan)',
                        difference: 'التعاقد اتفاق محدد بين الأخصائي والعميل على أهداف وجلسات ومسؤوليات مشتركة، بينما الخطة العلاجية هي الرؤية والاستراتيجيات العامة للتدخل.',
                        trap: 'اعتبار التعاقد عقداً قانونياً جنائياً بدلاً من كونه اتفاقاً مهنياً علاجياً تشاركياً ينمي التزام العميل.'
                    },
                    {
                        term1: 'حق تقرير المصير (Self-Determination)',
                        term2: 'الوصاية وفرض الحلول (Paternalism)',
                        difference: 'تقرير المصير تمكين العميل من اختيار بدائل الحل بنفسه وتحمل المسؤولية، بينما الوصاية فرض الأخصائي لحلوله على العميل دون إشراكه.',
                        trap: 'الظن بأن كفاءة الأخصائي تقتضي أن يفرض على العميل ما يراه صالحاً له بسبب خبرة الأخصائي الأعلى.'
                    },
                    {
                        term1: 'السرية المهنية المقيدة (Relative Confidentiality)',
                        term2: 'السرية المهنية المطلقة (Absolute Confidentiality)',
                        difference: 'السرية في الخدمة الاجتماعية نسبية وليست مطلقة، حيث يلزم الإفصاح عند وجود خطر إيذاء النفس أو الغير أو إساءة معاملة الأطفال أو أمر قضائي.',
                        trap: 'اعتبار السرية مبدأً مطلقاً لا يجوز خرقه أبداً حتى لو هدد العميل صراحة بالانتحار أو إيذاء الآخرين.'
                    },
                    {
                        term1: 'مهارة إنهاء التدخل (Termination)',
                        term2: 'الانقطاع المفاجئ (Abandonment)',
                        difference: 'الإنهاء عملية مهنية مخطط لها وتدريجية لمراجعة الإنجازات وتهيئة العميل للاستقلال، بينما الانقطاع تخلي مفاجئ يسبب انتكاسة للعميل.',
                        trap: 'اعتبار إنهاء التدخل يتم تلقائياً بمجرد اختفاء العرض المرضي دون جلسة تقييم وتوديع وتهيئة للاستقلال.'
                    },
                    {
                        term1: 'التسجيل المهني الهادف (Professional Recording)',
                        term2: 'التدوين الحرفي السكرتاري (Clerical Dictation)',
                        difference: 'التسجيل المهني ينتقي الوقائع ذات الدلالة النفسية والاجتماعية ويحللها لخدمة التشخيص، بينما التدوين الحرفي كتابة كل كلمة دون فرز أو تحليل.',
                        trap: 'الاعتقاد بأن أفضل تقرير حالة هو الذي يسجل كل لفظ نطقه العميل حرفياً دون استخلاص مهني.'
                    }
                ],
                examTraps: [
                    {
                        title: 'فخ تصنيف ليونبرج (Leonberg)',
                        exampleQuestion: 'تعتبر مهارة حل المشكلات وصنع القرار من المهارات التكيفية عند ليونبرج.',
                        trick: 'استبدال المهارات الوظيفية بالتكيفية؛ فحل المشكلات وظيفية، أما التوافق مع سياسة المؤسسة ونظمها فهو التكيفية.',
                        goldenRule: 'احفظ: تكيفية = توافق مع بيئة المؤسسة | وظيفية = بيانات وأشخاص وحل مشكلات وصنع قرار.'
                    },
                    {
                        title: 'فخ مصدر اكتساب المهارات (جامعة vs عمل)',
                        exampleQuestion: 'تُكتسب المهارات الخاصة في الخدمة الاجتماعية عبر المناهج الدراسية الجامعية التأسيسية.',
                        trick: 'عكس مصدر الاكتساب؛ الجامعة تمنح مهارات عامة، أما التدريب أثناء العمل (On-the-job) هو مصدر المهارات الخاصة.',
                        goldenRule: 'مهارات خاصة = تدريب أثناء العمل | مهارات عامة = دراسة جامعية تأسيسية.'
                    },
                    {
                        title: 'فخ عدد شروط نيل طومسون (Neil Thompson)',
                        exampleQuestion: 'حدد نيل طومسون لتنمية المهارات أربعة شروط رئيسية.',
                        trick: 'الرقم الصحيح هو 6 شروط متكاملة، وأهمها "استعداد الممارسين ذاتياً للتغيير".',
                        goldenRule: 'شروط نيل طومسون لتنمية المهارات = ستة شروط (6) وليس 4 أو 5.'
                    },
                    {
                        title: 'فخ إطلاق ممارسة المهارة (مطلقة vs نسبية)',
                        exampleQuestion: 'ممارسة المهارة في الخدمة الاجتماعية عملية مطلقة لا تتأثر بطبيعة المؤسسة.',
                        trick: 'ادعاء أن المهارة ثابتة ومطلقة؛ في الواقع المهارة نسبية محكومة بأربعة محددات.',
                        goldenRule: 'ممارسة المهارة نسبية دائماً ومحكومة بـ: الطريقة، المدخل، المؤسسة، والفترة الزمنية.'
                    },
                    {
                        title: 'فخ إطلاق مبدأ السرية المهنية',
                        exampleQuestion: 'مبدأ السرية في خدمة الفرد مبدأ مطلق لا استثناء فيه تحت أي ظرف.',
                        trick: 'استخدام كلمة "مطلق"؛ السرية مهنية نسبية وتُكسر قانونياً لحماية حياة العميل أو الغير أو الأطفال.',
                        goldenRule: 'أي عبارة تصف السرية بـ "مطلقة" أو "لا استثناء لها" هي عبارة خاطئة 100%.'
                    },
                    {
                        title: 'فخ تعريف المهارة إجرائياً واقتصادياً',
                        exampleQuestion: 'المهارة إجرائياً هي بذل أقصى جهد عضلي وبدني ممكن لإتمام التدخل.',
                        trick: 'إبدال "أقل جهد وتكلفة" بـ "أقصى جهد"؛ فالمعيار الاقتصادي للمهارة هو التوفير والكفاءة والدقة.',
                        goldenRule: 'المهارة إجرائياً واقتصادياً = أقل جهد + أقل تكلفة + أسرع وقت + أعلى عائد ودقة.'
                    },
                    {
                        title: 'فخ المهارات القيمية وتطبيقها السلوكي',
                        exampleQuestion: 'المهارات القيمية هي مجرد معارف فكرية نظرية لا تترجم إلى ممارسات وسلوكيات عملية.',
                        trick: 'فصل القيم عن السلوك؛ فالمهارة القيمية جوهرها ترجمة قيم وأخلاقيات المهنة لسلوك ميداني وغرسها بالعميل.',
                        goldenRule: 'المهارة القيمية = ترجمة قيم المهنة لسلوك ملموس في التعامل مع المسترشدين.'
                    },
                    {
                        title: 'فخ مراحل عملية المساعدة وترتيبها',
                        exampleQuestion: 'تبدأ عملية المساعدة بوضع خطة العلاج تليها دراسة الحالة ثم التقدير.',
                        trick: 'قلب الترتيب المنطقي؛ فالعملية متسلسلة تبدأ بجمع الحقائق (الدراسة)، ثم التفسير والتقدير، وأخيراً اتجاهات العلاج.',
                        goldenRule: 'التسلسل العلمي الحتمي: جمع الحقائق ➔ التقدير والتشخيص ➔ تحديد اتجاهات العلاج.'
                    },
                    {
                        title: 'فخ حق تقرير المصير والوصاية',
                        exampleQuestion: 'يمارس الأخصائي مهارة التدخل بفرض الحل الأنسب من وجهة نظره على العميل لقلة خبرة العميل.',
                        trick: 'خرق مبدأ حق تقرير المصير؛ فدور الأخصائي تمكيني وتوضيح البدائل، وليس فرض القرارات والوصاية.',
                        goldenRule: 'الأخصائي لا يقرر بالنيابة عن العميل؛ دوره تمكيني وتنويري واستشاري.'
                    },
                    {
                        title: 'فخ التعاطف المهني مقابل الشفقة',
                        exampleQuestion: 'أفضل تعبير عن العلاقة المهنية الناجحة هو مشاركة العميل مشاعر الشفقة والبكاء معه على مشكلته.',
                        trick: 'الخلط بين التعاطف المهني (Empathy) والشفقة الشخصية (Sympathy)؛ فالشفقة تُفقد الأخصائي حياده وموضوعيته.',
                        goldenRule: 'التعاطف فهم موضوعي مع الحفاظ على الحياد؛ والشفقة انفعال سلبي يضر بالعميل والتدخل.'
                    },
                    {
                        title: 'فخ المهارات الفطرية والمكتسبة',
                        exampleQuestion: 'المهارات المهنية في الخدمة الاجتماعية هي مواهب فطرية يولد بها الإنسان ولا يمكن اكتسابها بالتعلم.',
                        trick: 'إنكار الجانب العلمي والتدريبي؛ فالمهارات المهنية مكتسبة وقابلة للتعلم والتطوير بالدراسة والتدريب.',
                        goldenRule: 'المهارات المهنية = مكتسبة وقابلة للتعليم والصقل والقياس وليست فطرية موروثة.'
                    },
                    {
                        title: 'فخ استبدال مصطلح Skill باشتقاقه اللغوي',
                        exampleQuestion: 'كلمة Skill الإنجليزية مشتقة لغوياً من الجذر العربي (مَهُرَ).',
                        trick: 'خلط اللغات والاشتقاقات؛ فـ (مَهُرَ) أصل المهارة بالعربية، أما كلمة Skill فتعني البراعة أو تقديم الخدمة.',
                        goldenRule: 'في الاشتقاق: (مَهُرَ) أصل عربي | و Skill تعني البراعة وتقديم الخدمة باللغة الإنجليزية.'
                    },
                    {
                        title: 'فخ العلاقة المهنية والصداقة الشخصية',
                        exampleQuestion: 'العلاقة المهنية في خدمة الفرد تتطابق تماماً في خصائصها مع علاقة الصداقة والقرابة الشخصية.',
                        trick: 'العلاقة المهنية هادفة، محددة بوقت، مقننة بأخلاقيات، وتنتهي بانتهاء الهدف، بعكس الصداقات الشخصية التلقائية.',
                        goldenRule: 'العلاقة المهنية محكومة بالهدف والمؤسسة والمسؤولية والوقت وليست صداقة شخصية حرة.'
                    },
                    {
                        title: 'فخ التسجيل السري للمقابلات',
                        exampleQuestion: 'يحق للأخصائي تسجيل صوت وفيديو المقابلة سراً دون إعلام العميل لضمان تلقائيته في الحديث.',
                        trick: 'انتهاك جسيم لميثاق الشرف الأخلاقي وحق العميل في المعرفة والموافقة المستنيرة.',
                        goldenRule: 'يمنع منعاً باتاً أي تسجيل للمقابلة دون موافقة مستنيرة وصريحة ومسبقة من العميل.'
                    },
                    {
                        title: 'فخ أسلوب التدخل وإغفال البيئة المحيطة',
                        exampleQuestion: 'تركز خدمة الفرد على تعديل سلوك الفرد بمعزل تام عن أسرته ومحيطه البيئي والاجتماعي.',
                        trick: 'إغفال النظرة الإيكولوجية الشمولية؛ فالإنسان كائن اجتماعي يعيش في تفاعل مستمر مع نسق أسرته وبيئته.',
                        goldenRule: 'خدمة الفرد تنظر للشخص داخل بيئته (Person-in-Environment)، وتتدخل في الذات والموقف البيئي معاً.'
                    }
                ],
                mcqAnalyzer: {
                    question: 'يصنف العالم (ليونبرج - Leonberg) المهارات الأساسية في ممارسة خدمة الفرد إلى نوعين رئيسيين هما:',
                    options: [
                        { letter: 'أ', text: 'مهارات فردية ومهارات جماعية', isCorrect: false, explanation: 'خاطئة تماماً؛ هذا تصنيف لطرق الخدمة الاجتماعية وليس تصنيف العالم ليونبرج للمهارات.' },
                        { letter: 'ب', text: 'مهارات تكيفية (Adaptive) ومهارات وظيفية (Functional)', isCorrect: true, explanation: 'صحيحة ونموذجية 100%؛ حدد ليونبرج المهارات التكيفية للتوافق مع المؤسسة والوظيفية لحل المشكلات والتعامل مع الأشخاص.' },
                        { letter: 'ج', text: 'مهارات تشخيصية ومهارات علاجية فقط', isCorrect: false, explanation: 'خاطئة؛ هذه مراحل لعملية المساعدة في خدمة الفرد وليست تصنيف ليونبرج.' },
                        { letter: 'د', text: 'مهارات نظرية ومهارات مادية موروثة', isCorrect: false, explanation: 'خاطئة وفخ؛ المهارات المهنية مكتسبة وقابلة للتعلم وليست قدرات فطرية موروثة.' }
                    ]
                },
                mnemonics: [
                    {
                        title: 'شفرة شروط نيل طومسون الستة لتنمية المهارات (مَـتـْـثـَـعـِـع)',
                        code: 'مَـ • تـْـ • ثـَـ • عـَـ • إِ • عـُـ',
                        items: [
                            { letter: 'مَـ (مردود)', meaning: 'تحديد مردود الممارسة وقياس نتائجها' },
                            { letter: 'تـْـ (تغيير)', meaning: 'استعداد الممارسين ذاتياً للتغيير وتجاوز القصور' },
                            { letter: 'ثـَـ (ثقة)', meaning: 'الثقة بالنفس والدافعية المهنية العالية' },
                            { letter: 'عـَـ (عِبرة)', meaning: 'التعلم من الآخرين والزملاء في الميدان' },
                            { letter: 'إِ (إشراف)', meaning: 'الاستفادة من التوجيه الإشرافي والتدريب المستمر' },
                            { letter: 'عـُـ (تعليم)', meaning: 'التعليم المتواصل ومتابعة أحدث المستجدات' }
                        ]
                    },
                    {
                        title: 'شفرة محددات ممارسة المهارة الأربعة (طـَـمـْـمـَـز)',
                        code: 'ط • م • م • ز',
                        items: [
                            { letter: 'ط (طريقة)', meaning: 'طريقة الممارسة (أفراد، جماعات، تنظيم مجتمع)' },
                            { letter: 'م (مدخل)', meaning: 'مدخل الممارسة والإطار النظري المعتمد' },
                            { letter: 'م (مؤسسة)', meaning: 'طبيعة ونوع المؤسسة (مدرسة، مستشفى، رعاية أحداث)' },
                            { letter: 'ز (زمن)', meaning: 'الفترة الزمنية المتاحة لخطة التدخل المهني' }
                        ]
                    },
                    {
                        title: 'شفرة أبعاد تكامل عملية المساعدة (حـَـتـْـع)',
                        code: 'حقائق ➔ تفسير ➔ علاج',
                        items: [
                            { letter: 'ح', meaning: 'المهارة في جمع الحقائق والمعلومات الدراسية' },
                            { letter: 'ت', meaning: 'المهارة في التفسير والتشخيص والتقدير' },
                            { letter: 'ع', meaning: 'المهارة في تحديد اتجاهات العلاج والتدخل' }
                        ]
                    }
                ],
                capsule: [
                    { heading: '1. المفهوم اللغوي والإجرائي للمهارة', body: 'لغوياً: مشتقة من (مَهُرَ بالشيء) أي أحكمه وأتقنه وصار به حاذقاً. وبالإنجليزية Skill تعني البراعة أو تقديم الخدمة. إجرائياً واقتصادياً: أداء العمل الفكري أو العملي بأقل جهد وتكلفة وأسرع وقت وأعلى دقة وعائد ممكن.' },
                    { heading: '2. تصنيف ليونبرج للمهارات (Leonberg)', body: 'صنف المهارات إلى نوعين: 1) مهارات تكيفية (Adaptive): تمكن من الانسجام مع البيئة التنظيمية للمؤسسة. 2) مهارات وظيفية (Functional): لحل المشكلات وصنع القرار والتحليل والتعامل مع الأشخاص.' },
                    { heading: '3. المهارات العامة مقابل المهارات الخاصة', body: 'المهارات العامة (كالمقابلة والعلاقة المهنية والتقدير) تكتسب عبر الدراسة الأكاديمية الجامعية. المهارات الخاصة تكتسب عبر برامج التدريب أثناء العمل (On-the-job training).' },
                    { heading: '4. شروط نيل طومسون الستة (Neil Thompson 2000)', body: '1) تحديد مردود الممارسة، 2) استعداد الممارسين ذاتياً للتغيير، 3) الثقة بالنفس، 4) التعلم من الآخرين، 5) الاستفادة من الإشراف، 6) التعليم المتواصل.' },
                    { heading: '5. محددات ممارسة المهارة (أربعة محددات)', body: 'ممارسة المهارة نسبية وتتحدد بـ: 1) طريقة الممارسة، 2) مدخل الممارسة، 3) نوع وبيئة المؤسسة، 4) الفترة الزمنية المتاحة للتدخل.' }
                ],
                mindMap: {
                    root: `${subj} - ${title}`,
                    branches: [
                        {
                            title: 'المفهوم والاشتقاق اللغوي',
                            subItems: [
                                { title: 'لغوياً (مَهُرَ)', detail: 'الإحكام والإتقان والحذق بالشيء.' },
                                { title: 'إنجليزياً (Skill)', detail: 'البراعة أو تقديم الخدمة بجودة.' },
                                { title: 'التعريف الاقتصادي', detail: 'أقل جهد وتكلفة وأسرع وقت وأعلى عائد ودقة.' }
                            ]
                        },
                        {
                            title: 'تصنيفات المهارات المهنية',
                            subItems: [
                                { title: 'تصنيف ليونبرج', detail: 'مهارات تكيفية (للمؤسسة) + وظيفية (لحل المشكلات).' },
                                { title: 'العامة والخاصة', detail: 'عامة بالجامعة | خاصة بالتدريب أثناء العمل.' },
                                { title: 'المهارات القيمية', detail: 'ترجمة قيم المهنة إلى سلوك وأداء واقعي.' }
                            ]
                        },
                        {
                            title: 'شروط نيل طومسون لتنمية المهارات',
                            subItems: [
                                { title: 'الذاتية والتطوير', detail: 'استعداد الممارس للتغيير وتحديد المردود.' },
                                { title: 'البيئة المهنية', detail: 'التعلم من الآخرين والاستفادة من الإشراف والتعليم المستمر.' }
                            ]
                        },
                        {
                            title: 'محددات ممارسة المهارة',
                            subItems: [
                                { title: 'الطريقة والمدخل', detail: 'تختلف مهارات خدمة الفرد عن خدمة الجماعة.' },
                                { title: 'المؤسسة والزمن', detail: 'تختلف مهارات المدرسة عن المستشفى بحسب ضغط الوقت.' }
                            ]
                        }
                    ]
                },
                chapterSummary: {
                    title: 'الموجز الذهبي الشامل لمحتوى الدرس والمذكرة',
                    content: `
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div style="background:var(--ast-surface-soft); border-right:4px solid #D4973B; padding:12px 16px; border-radius:0 10px 10px 0;">
                                <h4 style="color:#D4973B; font-weight:900; margin-bottom:4px; font-size:14.5px;">📌 1. أصل المفهوم والتعريف اللغوي والإجرائي للمهارة</h4>
                                <p style="margin:0; font-size:13px; line-height:1.7;">
                                    • <b>لغوياً:</b> مشتقة من الفعل العربي <i>(مَهُرَ بالشيء)</i> أي أحكمه وأتقنه وصار به حاذقاً وعليماً به. وباللغة الإنجليزية مصطلح <b>(Skill)</b> يعني البراعة أو تقديم الخدمة بجودة وإتقان.<br>
                                    • <b>إجرائياً واقتصادياً:</b> إنجاز العمل الفكري أو التطبيقي بأربعة معايير متكاملة: <b>(أقل جهد + أقل تكلفة + أسرع وقت + أعلى عائد ودقة ممكنة)</b>.
                                </p>
                            </div>

                            <div style="background:var(--ast-surface-soft); border-right:4px solid #3B82F6; padding:12px 16px; border-radius:0 10px 10px 0;">
                                <h4 style="color:#3B82F6; font-weight:900; margin-bottom:4px; font-size:14.5px;">📌 2. تصنيف العالم (ليونبرج - Leonberg) للمهارات</h4>
                                <p style="margin:0; font-size:13px; line-height:1.7;">
                                    يُصنف ليونبرج المهارات الأساسية في ممارسة خدمة الفرد إلى فئتين جوهريتين:<br>
                                    1️⃣ <b>مهارات تكيفية (Adaptive Skills):</b> تُمكّن الأخصائي من التوافق والانسجام التام مع البيئة التنظيمية للمؤسسة واستيعاب لوائحها ونظمها الإدارية.<br>
                                    2️⃣ <b>مهارات وظيفية (Functional Skills):</b> تختص بالتعامل مع البيانات وفهم الأشخاص، وتتضمن: (حل المشكلات، صنع القرار، التحليل، والتقييم).
                                </p>
                            </div>

                            <div style="background:var(--ast-surface-soft); border-right:4px solid #10B981; padding:12px 16px; border-radius:0 10px 10px 0;">
                                <h4 style="color:#10B981; font-weight:900; margin-bottom:4px; font-size:14.5px;">📌 3. مصدر اكتساب المهارات (العامة مقابل الخاصة)</h4>
                                <p style="margin:0; font-size:13px; line-height:1.7;">
                                    • <b>المهارات العامة (General Skills):</b> كالاستماع والمقابلة وإقامة العلاقة المهنية والتقدير؛ تُكتسب وتُبنى عبر <b>الدراسة الأكاديمية التأسيسية</b> في الكليات والمعاهد الجامعية.<br>
                                    • <b>المهارات الخاصة (Specific Skills):</b> ترتبط بوظيفة معينة وتُكتسب حصراً من خلال <b>برامج التدريب أثناء العمل (On-the-job training)</b> داخل الميدان.
                                </p>
                            </div>

                            <div style="background:var(--ast-surface-soft); border-right:4px solid #8B5CF6; padding:12px 16px; border-radius:0 10px 10px 0;">
                                <h4 style="color:#8B5CF6; font-weight:900; margin-bottom:4px; font-size:14.5px;">📌 4. شروط نيل طومسون (Neil Thompson) الستة لتنمية المهارات</h4>
                                <p style="margin:0; font-size:13px; line-height:1.7;">
                                    حدد طومسون ستة شروط متكاملة للارتقاء بالمهارة: <b>1) تحديد مردود الممارسة، 2) استعداد الممارسين ذاتياً للتغيير وتجاوز القصور، 3) الثقة بالنفس والدافعية، 4) التعلم من الزملاء والآخرين، 5) الاستفادة من الإشراف المهني، 6) التعليم المستمر والمتابعة المعرفية.</b>
                                </p>
                            </div>

                            <div style="background:var(--ast-surface-soft); border-right:4px solid #EF4444; padding:12px 16px; border-radius:0 10px 10px 0;">
                                <h4 style="color:#EF4444; font-weight:900; margin-bottom:4px; font-size:14.5px;">📌 5. محددات ممارسة المهارة (عملية نسبية وليست مطلقة)</h4>
                                <p style="margin:0; font-size:13px; line-height:1.7;">
                                    ممارسة المهارة غير ثابتة وتتأثر بأربعة محددات: <b>(1. طريقة الممارسة، 2. مدخل الممارسة والإطار النظري، 3. نوع وطبيعة المؤسسة، 4. الفترة الزمنية المتاحة للتدخل)</b>.
                                </p>
                            </div>
                        </div>
                    `
                },
                podcast: {
                    script: 'موجز الفصل الأول المهارات المهنية مكتوب بالتفصيل بالأعلى.'
                },
                glossary: [
                    { ar: 'المهارة', en: 'Skill', definition: 'القدرة على أداء العمل الفكري أو الميداني بأقل جهد وتكلفة وأسرع وقت وأعلى عائد ودقة.', example: 'مهارة إدارة المقابلة الفردية مع الحالات الحرجة.' },
                    { ar: 'المهارات التكيفية', en: 'Adaptive Skills', definition: 'المهارات التي تُمكّن الأخصائي الاجتماعي من التوافق والانسجام مع البيئة التنظيمية للمؤسسة الاجتماعية.', example: 'الالتزام بنظم العمل وسياسات المؤسسة ولوائحها.' },
                    { ar: 'المهارات الوظيفية', en: 'Functional Skills', definition: 'المهارات التي تمكن الأخصائي من التعامل مع البيانات والأشخاص وفهمهم كحل المشكلات وصنع القرار والتحليل.', example: 'تحليل أسباب تسرب الطلاب وصنع قرار الخطة التدخلية.' },
                    { ar: 'المهارات الخاصة', en: 'Specific Skills', definition: 'مهارات ضرورية لأداء عمل أو منصب معين ويتم تعلمها بالتدريب أثناء العمل.', example: 'استخدام برامج إدارة الملفات الطبية داخل المستشفيات.' },
                    { ar: 'المهارات العامة', en: 'General Skills', definition: 'مهارات تأسيسية مكتسبة عبر الدراسة الأكاديمية الجامعية.', example: 'إقامة العلاقة المهنية، المقابلة، التقدير، والتعاقد.' },
                    { ar: 'المهارات القيمية', en: 'Values Skills', definition: 'ترجمة قيم وأخلاقيات المهنة إلى سلوك عملي وملموس وغرسها في نفوس العملاء.', example: 'احترام كرامة العميل وسرية بياناته في الممارسة اليومية.' },
                    { ar: 'محددات الممارسة', en: 'Practice Determinants', definition: 'العوامل الأربعة التي تجعل المهارة نسبية (الطريقة، المدخل، نوع المؤسسة، والفترة الزمنية).', example: 'اختلاف مهارات الأخصائي بين العمل في مدرسة والعمل في مستشفى أورام.' }
                ],
                diagrams: [
                    {
                        title: 'مخطط منظومة تنمية المهارات المهنية (نيل طومسون 2000)',
                        context: 'يوضح الشروط الستة المتكاملة لحدوث الارتقاء المهني المستمر للأخصائي.',
                        stages: [
                            { name: '1. مردود الممارسة', meaning: 'قياس أثر التدخل والنتائج الفعلية على الحالات.' },
                            { name: '2. الاستعداد الذاتي للتغيير', meaning: 'المرونة والتخلي عن الأساليب التقليدية غير المجدية.' },
                            { name: '3. الثقة والدافعية', meaning: 'الإيمان بالقدرات المهنية والتطلع للإنجاز.' },
                            { name: '4. التعلم من الزملاء', meaning: 'تبادل الخبرات والاستفادة من تجارب الآخرين.' },
                            { name: '5. الاستفادة من الإشراف', meaning: 'تلقي التغذية الراجعة من الموجهين والأشخاص ذوي الخبرة.' },
                            { name: '6. التعليم المتواصل', meaning: 'المتابعة الدائمة للأبحاث والدورات التخصصية.' }
                        ]
                    },
                    {
                        title: 'مخطط تكامل عملية المساعدة في خدمة الفرد',
                        context: 'الأبعاد الثلاثة المتسلسلة لممارسة المهارة بكفاءة.',
                        stages: [
                            { name: 'جمع الحقائق الدراسية', meaning: 'استيفاء البيانات الشاملة من المسترشد وبيئته المحيطة.' },
                            { name: 'التفسير والتقدير', meaning: 'تحليل المعطيات وربط الأسباب بالنتائج وتحديد القوى.' },
                            { name: 'تحديد اتجاهات العلاج', meaning: 'وضع الاستراتيجيات التدخلية المناسبة لتحقيق التوافق.' }
                        ]
                    }
                ],
                flashcards: realFlashcards,
                top10Predictions: realPredictions,
                recitePrompt: {
                    topic: 'شروط نيل طومسون (Neil Thompson) الستة لتنمية المهارات',
                    keywords: ['المردود', 'التغيير', 'الثقة', 'الآخرين', 'الإشراف', 'التعليم المستمر']
                },
                essayQuestion: {
                    question: 'ناقش بالتفصيل تصنيف العالم (ليونبرج) للمهارات في خدمة الفرد، مبيناً الفارق بين المهارات العامة والخاصة، ثم اشرح شروط نيل طومسون الستة لتنمية المهارات المهنية.',
                    rubricPoints: [
                        'تعريف وتوضيح المهارات التكيفية والمهارات الوظيفية عند ليونبرج بالأمثلة (درجتان).',
                        'المقارنة الدقيقة بين المهارات العامة ومصدرها الأكاديمي والمهارات الخاصة ومصدرها التدريبي أثناء العمل (درجتان).',
                        'سرد وشرح شروط نيل طومسون الستة لتنمية المهارات (درجتان).',
                        'توضيح محددات ممارسة المهارة الأربعة ونسبيتها وجودة الصياغة العلمية (درجة).'
                    ]
                },
                stepByStep: {
                    scenario: 'أخصائي اجتماعي تم نقله من العمل في مدرسة ثانوية إلى العمل في مستشفى لعلاج الأورام. كيف يوظف مهاراته بحسب محددات الممارسة ونموذج ليونبرج؟',
                    steps: [
                        { name: 'الخطوة 1: تفعيل المهارات التكيفية لملاءمة المؤسسة', desc: 'استيعاب اللوائح الطبية للمستشفى، التوافق مع الفريق الطبي المعالج، وفهم طبيعة المرض والصدمة النفسية للمرضى.' },
                        { name: 'الخطوة 2: مراعاة محدد الفترة الزمنية', desc: 'في المدرسة قد تتاح أشهر كاملة للتدخل، أما في المستشفى فالوقت ضيق وحرج ويتطلب مهارات التدخل في الأزمات السريعة.' },
                        { name: 'الخطوة 3: اكتساب المهارات الخاصة عبر التدريب أثناء العمل', desc: 'الالتحاق ببرامج تدريبية تخصصية بالمستشفى لاكتساب مهارات إرشاد مرضى الأورام وذويهم.' },
                        { name: 'الخطوة 4: توظيف المهارات الوظيفية العامة', desc: 'تطبيق مهارات المقابلة والتقدير السريع وحل المشكلات لربط المريض بالدعم النفسي والمجتمعي.' }
                    ]
                },
                timestamps: [
                    { seconds: 90, timeText: '01:30', topic: 'المفهوم اللغوي والإجرائي والاقتصادي للمهارة', summary: 'اشتقاق مَهُرَ، ومصطلح Skill، ومعايير الجهد والتكلفة والعائد.' },
                    { seconds: 435, timeText: '07:15', topic: 'تصنيف ليونبرج (التكيفية والوظيفية)', summary: 'شرح مهارات الانسجام مع المؤسسة مقابل حل المشكلات.' },
                    { seconds: 885, timeText: '14:45', topic: 'المهارات العامة والخاصة والمهارات القيمية', summary: 'الفرق بين التعليم الجامعي والتدريب أثناء العمل.' },
                    { seconds: 1330, timeText: '22:10', topic: 'شروط نيل طومسون الستة لتنمية المهارات', summary: 'قواعد الارتقاء بالمهارة والاستعداد الذاتي للتغيير.' },
                    { seconds: 1860, timeText: '31:00', topic: 'محددات ممارسة المهارة وأسئلة الامتحان المتوقعة', summary: 'الطريقة والمدخل ونوع المؤسسة والزمن وتدريبات الـ 50 سؤالاً.' }
                ],
                weaknessQuiz: {
                    q: 'تكتسب المهارات الخاصة (Specific Skills) الواردة في تصنيف ليونبرج على أفضل وجه من خلال:',
                    timestampSec: 885,
                    options: [
                        { text: 'الدراسة الأكاديمية النظرية في قاعات الجامعة', isCorrect: false, diagText: 'خطأ شائع! الدراسة الجامعية تمنح المهارات العامة (كالمقابلة والتقدير)، بينما المهارات الخاصة تكتسب حصراً بالتدريب أثناء العمل.' },
                        { text: 'برامج التدريب أثناء العمل (On-the-job training) لأداء وظيفة معينة', isCorrect: true, diagText: 'إجابة نموذجية ممتازة متوافقة 100% مع تصنيف ليونبرج المعتمد.' },
                        { text: 'الخبرات الفطرية والمواهب الموروثة دون تعلم', isCorrect: false, diagText: 'المهارات المهنية مكتسبة بالتدريب المنظم وليست قدرات فطرية عشوائية.' }
                    ]
                },
                feynmanExplanation: `بص يا صديقي، الموضوع أبسط مما تتخيل! تخيل إنك مهندس برمجيات شاطر اتعينت في شركة جديدة.. عشان تنجح محتاج حاجتين زي ما قال العالم "ليونبرج": 
أولاً "مهارات تكيفية": يعني تعرف مواعيد الشركة، نظام الإجازات، طريقة التعامل مع المدير وزمايلك، عشان تنسجم مع المكان وماتعملش مشاكل.. دي مهارة التكيف مع بيئة المؤسسة!
ثانياً "مهارات وظيفية": دي بقى مهارتك في كتابة الكود وتصليح الأعطال وحل المشكلات التقنية نفسها..
ولما تيجي تسأل: "أنا اتعلمت فين؟".. الجامعة علمتك "مهارات عامة" زي أساسيات البرمجة وقواعدها، لكن الشركة بتعملك "تدريب أثناء الشغل" عشان يديك "مهارات خاصة" بنظام الشغل عندهم بالظبط!
وعشان مهارتك ماتموتش، جه العالم "نيل طومسون" وقالنا 6 شروط، وأهم شرط فيهم: لو طريقتك القديمة مش نافعة، خلي عندك شجاعة تغيرها وتتعلم الجديد من زمايلك الكبار! شفت بقى إن المهارات المهنية دي بنعيشها في كل يوم؟`,
                prerequisites: [
                    { concept: 'مدخل الرعاية الاجتماعية والخدمة الاجتماعية', howItConnects: 'لفهم المظلة المؤسسية التي تحكم ممارسة الأخصائي وتحدد واجباته.' },
                    { concept: 'أسس الممارسة المهنية لطريقة خدمة الفرد', howItConnects: 'لاستحضار مراحل عملية المساعدة (الدراسة، التقدير، والتدخل العلاجي).' }
                ],
                derivation: [
                    { heading: '1. مرحلة الاجتهاد الشخصي والعمل الخيري', explanation: 'كانت المساعدة تقدم بنوايا حسنة دون وجود قواعد فنية مقننة لكيفية التدخل.' },
                    { heading: '2. ظهور الحاجة للتأطير العلمي المقنن', explanation: 'مع تعقد المشكلات الإنسانية، ظهرت الحاجة لتعريف "المهارة" وفصلها عن مجرد الموهبة الفطرية.' },
                    { heading: '3. نماذج ليونبرج وطومسون المعاصرة', explanation: 'تحديد تصنيفات علمية (تكيفية ووظيفية) وشروط لتنمية المهارات لضمان أعلى عائد بأقل تكلفة ووقت.' }
                ],
                keywordsScanner: [
                    { word: 'حصراً / فقط', rule: 'عادة تشير إلى خيار مقيد جداً، إذا وردت في سؤال عن مصادر المهارات (كأن يقال تُكتسب بالجامعة حصراً) تكون العبارة خاطئة لأن المهارات الخاصة تكتسب بالتدريب أثناء العمل.' },
                    { word: 'دائماً / مطلقاً', rule: 'كلمات مطلقة تنافي الطبيعة النسبية لممارسة الخدمة الاجتماعية (مثل: السرية مطلقة دائماً = خاطئة).' },
                    { word: 'إجرائياً واقتصادياً', rule: 'توجّه ذهنك مباشرة لمعادلة: (أقل جهد + أقل تكلفة + أسرع وقت + أعلى عائد ودقة).' },
                    { word: 'ليونبرج (Leonberg)', rule: 'توجّه ذهنك فوراً لثنائية: (مهارات تكيفية للمؤسسة + مهارات وظيفية لحل المشكلات والأشخاص).' },
                    { word: 'نيل طومسون (Neil Thompson)', rule: 'توجّه ذهنك لشروطه الستة، والتركيز على (استعداد الممارس ذاتياً للتغيير).' },
                    { word: 'محددات الممارسة', rule: 'توجّه ذهنك لأربعة عناصر: (الطريقة، المدخل، المؤسسة، الفترة الزمنية).' }
                ],
                trueFalseDetector: [
                    { pattern: 'الصيغة ذات الكلمة المطلقة (جميع / دائماً / لا استثناء)', analysis: 'احذر منها بنسبة 90%؛ فالخدمة الاجتماعية علم إنساني نسبي، فلا توجد قاعدة مطلقة بدون استثناء مهني.', sample: 'السرية في خدمة الفرد مبدأ مطلق لا استثناء له ➔ (خطأ).' },
                    { pattern: 'صيغة قلب المفاهيم (الخلط بين التكيفية والوظيفية)', analysis: 'واضع السؤال يستبدل وظيفة إحدى المهارتين بالأخرى بدهاء لاختبار دقة قراءتك.', sample: 'المهارات التكيفية تختص بحل المشكلات وصنع القرار ➔ (خطأ، هذه وظيفية).' },
                    { pattern: 'صيغة عكس جهة الاكتساب (الجامعة vs العمل)', analysis: 'يستبدل مكان اكتساب المهارات العامة بالخاصة.', sample: 'المهارات الخاصة تكتسب من المناهج الجامعية النظرية ➔ (خطأ، بالتدريب أثناء العمل).' },
                    { pattern: 'صيغة التبديل اللغوي (مَهُرَ vs Skill)', analysis: 'ينسب المعنى اللغوي العربي للفظ الإنجليزي أو العكس.', sample: 'كلمة Skill الإنجليزية مشتقة من الجذر العربي مَهُرَ ➔ (خطأ).' }
                ],
                cheatSheet: {
                    title: 'ورقة مراجعة ليلة الامتحان المركزة (Cheat Sheet في صفحة واحدة)',
                    sections: [
                        { hd: '1. أصل المفهوم', pts: ['لغوياً: مشتقة من (مَهُرَ بالشيء) أي أحكمه وأتقنه وصار به حاذقاً.', 'إنجليزية: Skill تعني البراعة أو تقديم الخدمة.', 'إجرائياً واقتصادياً: أقل جهد + أقل تكلفة + أسرع وقت + أعلى عائد ودقة.'] },
                        { hd: '2. تصنيف ليونبرج', pts: ['تكيفية: التوافق والانسجام مع البيئة التنظيمية للمؤسسة.', 'وظيفية: حل المشكلات، صنع القرار، التحليل، وفهم الأشخاص.'] },
                        { hd: '3. مصادر الاكتساب', pts: ['مهارات عامة: الدراسة الأكاديمية التأسيسية بالجامعة.', 'مهارات خاصة: برامج التدريب أثناء العمل (On-the-job training).'] },
                        { hd: '4. شروط نيل طومسون (6 شروط)', pts: ['مردود الممارسة + استعداد للتغيير + الثقة + التعلم من الزملاء + الإشراف + التعليم المستمر.'] },
                        { hd: '5. محددات الممارسة (4 محددات)', pts: ['الطريقة (أفراد/جماعات) + مدخل التدخل + نوع المؤسسة + الفترة الزمنية المتاحة.'] }
                    ]
                },
                speedDrill: [
                    { q: 'تكتسب المهارات الخاصة في الخدمة الاجتماعية عبر:', opts: ['المناهج الجامعية', 'التدريب أثناء العمل', 'الصدفة الفطرية'], ans: 1, why: 'المهارات الخاصة تكتسب ببرامج التدريب أثناء العمل حصراً.' },
                    { q: 'مهارة صنع القرار وحل المشكلات عند ليونبرج مهارة:', opts: ['تكيفية', 'وظيفية', 'عامة فقط'], ans: 1, why: 'حل المشكلات وظيفية، بينما التكيفية للانسجام مع المؤسسة.' },
                    { q: 'عدد شروط نيل طومسون لتنمية المهارات هو:', opts: ['4 شروط', '5 شروط', '6 شروط'], ans: 2, why: 'حدد طومسون 6 شروط متكاملة.' },
                    { q: 'ممارسة المهارة في الخدمة الاجتماعية تعتبر عملية:', opts: ['مطلقة وثابتة', 'نسبية محكومة بمحددات', 'عشوائية'], ans: 1, why: 'نسبية محكومة بـ: الطريقة والمدخل والمؤسسة والزمن.' },
                    { q: 'كلمة Skill الإنجليزية تعني في الممارسة:', opts: ['الجهد العضلي', 'البراعة أو تقديم الخدمة', 'الاشتقاق من مهر'], ans: 1, why: 'Skill تعني البراعة أو تقديم الخدمة بجودة.' },
                    { q: 'مبدأ السرية المهنية في الخدمة الاجتماعية هو مبدأ:', opts: ['مطلق تماماً', 'نسبي ومقيد بظروف محددة', 'اختياري للأخصائي'], ans: 1, why: 'السرية نسبية لحماية حياة العميل أو الآخرين.' }
                ],
                whyHowWhat: [
                    { concept: 'المهارات التكيفية (Adaptive)', what: 'ما هي؟ مهارات التوافق والانسجام مع لوائح ونظم المؤسسة الاجتماعية.', why: 'لماذا؟ لأن أي تدخل مهني يفشل إذا عجز الأخصائي عن العمل ضمن الإطار الإداري والتنظيمي للمؤسسة.', how: 'كيف تُمارس؟ باستيعاب اللوائح الداخلية، التنسيق مع فريق العمل، والتوافق مع رؤية المؤسسة.' },
                    { concept: 'المهارات الوظيفية (Functional)', what: 'ما هي؟ مهارات مهنية لحل المشكلات وصنع القرار والتحليل والتعامل مع الأشخاص.', why: 'لماذا؟ لأنها تمثل جوهر عملية التدخل لمساعدة العميل على تخطي أزمته واستعادة فاعليته.', how: 'كيف تُمارس؟ بالملاحظة الواعية، المقابلة المقننة، التقدير الدقيق، وصياغة خطط العلاج.' },
                    { concept: 'التدريب أثناء العمل (On-the-job)', what: 'ما هو؟ برامج تأهيلية وتدريبية ميدانية منظمة داخل مؤسسة العمل.', why: 'لماذا؟ لأن الدراسة الجامعية تمنح أطراً عامة ولا تستطيع تغطية الخصوصية الإجرائية لكل مؤسسة.', how: 'كيف يُمارس؟ بورش العمل، المحاكاة السريرية، والإشراف الميداني المباشر من القيادات.' }
                ],
                caseStudy: {
                    title: 'حالة الأخصائي "أحمد" في مركز رعاية وتأهيل الأحداث',
                    situation: 'أحمد أخصائي اجتماعي تم تعيينه حديثاً في دار رعاية الأحداث. لاحظ أن أحد النزلاء المراهقين يعاني من عزلة شديدة وعدوانية، وأثناء المقابلة الأولى أسرّ النزيل لأحمد بأنه ينوي إيذاء زميل له في الدار ليلاً بسلاح أبيض هربه للداخل، وطلب من أحمد أن يبقي الأمر سراً بناءً على مبدأ السرية المهنية!',
                    dilemma: 'هل يحافظ أحمد على السرية المطلقة كما وعد العميل، أم يفصح للإدارة لحماية حياة النزلاء؟',
                    options: [
                        { letter: 'أ', text: 'يحافظ على السرية التامة التزاماً بمبدأ سرية خدمة الفرد.', isCorrect: false, feedback: 'خطأ مهني فادح وكارثي! السرية نسبية وليست مطلقة، وعند وجود تهديد صريح لحياة الغير يلزم التدخل الفوري.' },
                        { letter: 'ب', text: 'الإفصاح المهني الفوري لإدارة المؤسسة لمنع الجريمة مع توضيح ذلك للنزيل بحكمة.', isCorrect: true, feedback: 'تصرف مهني نموذجي 100%! سلامة الأرواح مقدمة على السرية وفق ميثاق الشرف الأخلاقي، مع طمأنة النزيل بتقديم المساعدة له.' },
                        { letter: 'ج', text: 'يتجاهل الموقف حتى يتأكد بنفسه وقت حدوث المشاجرة.', isCorrect: false, feedback: 'إهمال مهني جسيم يعرض حياة النزلاء للخطر ويخالف مسؤوليات الوظيفة.' }
                    ],
                    lessonLearned: 'السرية في الخدمة الاجتماعية نسبية دائماً؛ واجب الحماية (Duty to Protect) وواجب التحذير يعلوان على أي مبدأ عند وجود خطر جسيم على النفس أو الآخرين.'
                },
                oralExam: [
                    { q: 'لو سألك الدكتور: ما الفارق الجوهري بين ما تتعلمه في الجامعة وما تتعلمه في التدريب أثناء العمل؟', ans: 'أجيبه بثقة: الجامعة تمنحني (المهارات العامة) كالمقابلة وبناء العلاقة والتقدير، بينما التدريب أثناء العمل يمنحني (المهارات الخاصة) التخصصية المرتبطة بوظيفة أو مؤسسة معينة كإدارة ملفات المرضى أو برامج الأحداث.' },
                    { q: 'لو سألك الدكتور: هل ممارسة المهارة مطلقة أم نسبية؟ ولماذا؟', ans: 'أجيبه: ممارسة المهارة نسبية دائماً، ومحكومة بأربعة محددات: طريقة الممارسة (أفراد/جماعات)، ومدخل التدخل النظري، وطبيعة المؤسسة، والفترة الزمنية المتاحة.' },
                    { q: 'لو سألك الدكتور: إلى ماذا قسّم العالم ليونبرج المهارات؟', ans: 'أجيبه: قسّمها إلى نوعين رئيسيين: مهارات تكيفية (Adaptive Skills) للتوافق مع بيئة ونظم المؤسسة، ومهارات وظيفية (Functional Skills) للتعامل مع البيانات والأشخاص وحل المشكلات.' },
                    { q: 'لو سألك الدكتور: ما أهم شرط في شروط نيل طومسون لتنمية المهارات؟', ans: 'أجيبه: أهم الشروط هو (استعداد الممارسين ذاتياً للتغيير) وتجاوز الأساليب التقليدية غير المجدية، بالإضافة إلى 5 شروط أخرى كالمردود والإشراف والتعليم المستمر.' },
                    { q: 'لو سألك الدكتور: هل تقتصر المهارة على الجانب المعرفي فقط؟', ans: 'أجيبه: إطلاقاً يا دكتور، المهارة منظومة متكاملة تشمل مهارات معرفية، ومهارات أدائية تطبيقية، ومهارات قيمية سلوكية تترجم أخلاقيات المهنة لواقع عملي.' }
                ],
                criticalThinking: {
                    scenario: 'تخيل مؤسسة اجتماعية قررت الاستغناء عن التدريب أثناء العمل (On-the-job training) واكتفت فقط بشهادة التخرج الجامعية للممارسين، وتوقع حدوث ذلك على جودة الخدمات المقدمة للحالات.',
                    prompt: 'حلل هذا الموقف وفق نظريات المهارات المهنية ومحددات الممارسة.',
                    analysisPoints: [
                        'عجز الممارسين عن التكيف مع البيئة التنظيمية واللوائح الخاصة بالمؤسسة (نقص المهارات التكيفية).',
                        'فجوة حادة بين النظريات الأكاديمية العامة والمهارات الخاصة الإجرائية التي تتطلبها مهام كل قسم.',
                        'انخفاض دقة العائد وارتفاع التكلفة والزمن، وهو ما ينافي التعريف الإجرائي والاقتصادي للمهارة.',
                        'الخلاصة: التدريب أثناء العمل ركيزة إلزامية لا غنى عنها لتحويل المعارف العامة لمهارات تخصصية دقيقة.'
                    ]
                },
                revisionChecklist: [
                    { id: 'chk_1', text: 'حفظت الأصل اللغوي (مَهُرَ) والمعنى الإنجليزي (Skill) والإجرائي (الجهد والوقت والتكلفة والعائد).' },
                    { id: 'chk_2', text: 'أتقنت تصنيف ليونبرج (التكيفية للانسجام مع المؤسسة + الوظيفية لحل المشكلات والأشخاص).' },
                    { id: 'chk_3', text: 'فرقت بين المهارات العامة (الجامعة) والمهارات الخاصة (التدريب أثناء العمل).' },
                    { id: 'chk_4', text: 'حفظت شروط نيل طومسون الستة وعلى رأسها الاستعداد الذاتي للتغيير.' },
                    { id: 'chk_5', text: 'استوعبت محددات ممارسة المهارة الأربعة ونسبيتها (طريقة، مدخل، مؤسسة، زمن).' },
                    { id: 'chk_6', text: 'راجعت الـ 15 فخاً امتحانياً والقواعد الذهبية لتفادي أسئلة صح وخطأ الخادعة.' },
                    { id: 'chk_7', text: 'راجعت مصفوفة المتشابهات الـ 15 وأهم الفوارق الفاصلة بين المصطلحات.' },
                    { id: 'chk_8', text: 'حللت أسئلة كويز المحاضرة والـ Top 10 أسئلة متوقعة للامتحان النهائي.' }
                ],
                askTutor: {
                    intro: 'اسأل مستشارك الأكاديمي الذكي عن أي جزئية في الفصل الأول (المهارات المهنية):',
                    faq: [
                        { q: 'ما الفرق السريع بين المهارات التكيفية والوظيفية؟', a: 'التكيفية: للتوافق مع سياسة ولوائح المؤسسة. الوظيفية: لحل المشكلات والتعامل مع الأشخاص وصنع القرار.' },
                        { q: 'من أين أكتسب المهارات الخاصة؟', a: 'من خلال برامج التدريب أثناء العمل (On-the-job training) داخل المؤسسة حصراً.' },
                        { q: 'كم عدد شروط نيل طومسون؟', a: 'ستة شروط (6)، وأهمها استعداد الممارس ذاتياً للتغيير وتجاوز القصور.' },
                        { q: 'لماذا ممارسة المهارة نسبية؟', a: 'لأنها محكومة بـ 4 محددات: طريقة الممارسة، مدخل التدخل، طبيعة المؤسسة، والفترة الزمنية.' }
                    ]
                }
            };
        }
    }

    // Expose Global Singleton
    window.ElkhetaAcademicAssistant = new AcademicAssistantEngine();

    // Auto-mount Quick Action Chips beneath video once DOM is ready or video updates
    window.mountElkhetaQuickChips = function() {
        const wrap = document.getElementById('elkVideoQuickChipsWrap');
        if (!wrap) return;
        wrap.innerHTML = `
            <div class="elk-video-quick-chips-bar" id="elkVideoQuickChipsBar">
                <button type="button" class="elk-quick-chip" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.openTool('capsule')">
                    <i class="fa-solid fa-list-check"></i>
                    <span>تلخيص المحاضرة</span>
                </button>
                <button type="button" class="elk-quick-chip" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.openTool('weakness_finder')">
                    <i class="fa-solid fa-circle-question"></i>
                    <span>اختبر فهمي بسؤال</span>
                </button>
                <button type="button" class="elk-quick-chip" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.openTool('confusing_terms')">
                    <i class="fa-solid fa-scale-balanced"></i>
                    <span>متشابهات بتلخبط</span>
                </button>
                <button type="button" class="elk-quick-chip" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.openTool('exam_traps')">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>مراجعة وأفخاخ الامتحان</span>
                </button>
                <button type="button" class="elk-quick-chip" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.openTool('flashcards')">
                    <i class="fa-solid fa-clone"></i>
                    <span>بطاقات التثبيت الذكية 🗂️</span>
                </button>
                <button type="button" class="elk-quick-chip elk-chip-highlight" onclick="window.ElkhetaAcademicAssistant && window.ElkhetaAcademicAssistant.toggleSidebar(true)">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>المساعد الأكاديمي الشامل (30 أداة تفاعلية) 🚀</span>
                </button>
            </div>
        `;
    };

})();
