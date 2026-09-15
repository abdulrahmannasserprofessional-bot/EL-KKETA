/**
 * 🌟 ELKHETA Motivational Quotes & Wisdom Engine
 * محرك درر العلم والآيات والأشعار المحفزة للطلاب
 */

(function(window) {
    const QUOTES_DATABASE = [
        // ─── 1. آيات الذكر الحكيم ───
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَقُل رَّبِّ زِدْنِي عِلْمًا»',
            source: 'سورة طه [114]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ»',
            source: 'سورة المجادلة [11]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ»',
            source: 'سورة الزمر [9]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ • وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ»',
            source: 'سورة النجم [39-40]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا»',
            source: 'سورة الكهف [30]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ»',
            source: 'سورة التوبة [105]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ»',
            source: 'سورة آل عمران [159]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«نَرْفَعُ دَرَجَاتٍ مَّن نَّشَاءُ ۗ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ»',
            source: 'سورة يوسف [76]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ»',
            source: 'سورة الطلاق [3]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«إِنَّ مَعَ الْعُسْرِ يُسْرًا • فَإِذَا فَرَغْتَ فَانصَبْ • وَإِلَىٰ رَبِّكَ فَارْغَب»',
            source: 'سورة الشرح [6-8]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ • الَّذِي عَلَّمَ بِالْقَلَمِ • عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ»',
            source: 'سورة العلق [1-5]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ»',
            source: 'سورة العنكبوت [69]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«رَبِّ اشْرَحْ لِي صَدْرِي • وَيَسِّرْ لِي أَمْرِي • وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي • يَفْقَهُوا قَوْلِي»',
            source: 'سورة طه [25-28]'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-book-quran',
            color: '#10B981',
            text: '«وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مِنْ أَمْرِهِ يُسْرًا»',
            source: 'سورة الطلاق [4]'
        },

        // ─── 2. أحاديث نبوية شريفة ───
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«مَن سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ له به طَرِيقًا إلى الجَنَّةِ»',
            source: 'صحيح مسلم'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«طَلَبُ العِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ»',
            source: 'رواه ابن ماجه'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«إنَّ اللَّهَ يُحِبُّ إذَا عَمِلَ أحَدُكُمْ عَمَلًا أنْ يُتْقِنَهُ»',
            source: 'رواه البيهقي'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«المُؤْمِنُ القَوِيُّ، خَيْرٌ وَأَحَبُّ إلى اللهِ مِنَ المُؤْمِنِ الضَّعِيفِ، وفي كُلٍّ خَيْرٌ»',
            source: 'صحيح مسلم'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«احْرِصْ علَى ما يَنْفَعُكَ، واسْتَعِنْ باللَّهِ ولا تَعْجِزْ»',
            source: 'صحيح مسلم'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«فَضْلُ العَالِمِ عَلَى العَابِدِ كَفَضْلِ القَمَرِ لَيْلَةَ البَدْرِ عَلَى سَائِرِ الكَوَاكِبِ»',
            source: 'رواه أبو داود والترمذي'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«إِذَا مَاتَ الإنْسَانُ انْقَطَعَ عنْه عَمَلُهُ إِلَّا مِن ثَلَاثَةٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو له»',
            source: 'صحيح مسلم'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«مَن يُرِدِ اللَّهُ به خَيْرًا يُفَقِّهْهُ في الدِّينِ»',
            source: 'متفق عليه'
        },
        {
            category: 'hadith',
            badge: '✨ حديث شريف',
            icon: 'fa-solid fa-sun',
            color: '#F59E0B',
            text: '«إنَّ المَلائِكَةَ لَتَضَعُ أَجْنِحَتَها رِضًا لِطالِبِ العِلْمِ»',
            source: 'رواه الترمذي وابن ماجه'
        },

        // ─── 3. روائع الشعر العربي في العلم والهمة ───
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«بِقَدرِ الكَدِّ تُكتَسَبُ المَعالي .. وَمَن طَلَبَ العُلا سَهِرَ اللَيالي»',
            source: 'الإمام الشافعي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وَمَن رَامَ العُلا مِن غَيرِ كَدٍّ .. أَضاعَ العُمرَ في طَلَبِ المُحالِ»',
            source: 'الإمام الشافعي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«اصبِر عَلى مُرِّ الجَفا مِن مُعَلِّمٍ .. فَإِنَّ رُسوبَ العِلمِ في نَفَراتِهِ»',
            source: 'الإمام الشافعي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وَمَن لَم يَذُق مُرَّ التَعَلُّمِ ساعَةً .. تَجَرَّعَ ذُلَّ الجَهلِ طولَ حَياتِهِ»',
            source: 'الإمام الشافعي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«عَلى قَدرِ أَهلِ العَزمِ تَأتي العَزائِمُ .. وَتَأتي عَلى قَدرِ الكِرامِ المَكارِمُ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وتَعْظُمُ في عَيْنِ الصّغيرِ صغارُها .. وتَصْغُرُ في عَيْنِ العَظيمِ العَظائِمُ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«ولم أرَ في عيوبِ الناسِ نقصاً .. كنقصِ القادرينَ على التمامِ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«إذا غامَرْتَ في شَرَفٍ مَرُومِ .. فَلا تَقْنَعْ بِما دُونَ النُّجُومِ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وما نيلُ المطالبِ بالتمني .. ولكن تُؤخَذُ الدنيا غِلابا»',
            source: 'أمير الشعراء أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وما استعصى على قومٍ منالٌ .. إذا الإقدامُ كان لهم رِكابا»',
            source: 'أمير الشعراء أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«قُم لِلمُعَلِّمِ وَفِّهِ التَبجيلا .. كادَ المُعَلِّمُ أَن يَكونَ رَسولا»',
            source: 'أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«العِلْمُ يَرفَعُ بَيْتاً لا عِمَادَ لَهُ .. والجَهْلُ يَهْدِمُ بَيْتَ العِزِّ والشَّرَفِ»',
            source: 'شعر عربي حكيم'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«تَعَلَّم فَلَيسَ المَرءُ يولَدُ عالِماً .. وَلَيسَ أَخو عِلمٍ كَمَن هُوَ جاهِلُ»',
            source: 'معن بن أوس'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«لأستسهلنّ الصعبَ أو أدرك المنى .. فما انقادت الآمالُ إلا لصابرِ»',
            source: 'ديوان الحكمة العربي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«الناسُ مَوتى وَأَهلُ العِلمِ أَحياءُ .. وَالجاهِلونَ لِأَهلِ العِلمِ أَعداءُ»',
            source: 'الإمام علي بن أبي طالب'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«ما الفَضلُ إِلّا لِأَهلِ العِلمِ إِنَّهُمُ .. عَلى الهُدى لِمَنِ اِستَهدى أَدِلّاءُ»',
            source: 'الإمام علي بن أبي طالب'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«يا طالِبَ العِلمِ لا تَبغِ بِهِ بَدَلاً .. فَقَد ظَفِرتَ وَرَبِّ اللَوحِ وَالقَلَمِ»',
            source: 'شعر عربي أصيل'
        },

        // ─── 4. درر وحكم التحفيز وصناعة المستقبل ───
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«القمة لا تتسع للكسالى، ولكنها تفتح ذراعيها لمن يواصل السير ولا يلتفت للوراء.»',
            source: 'حكمة دراسية'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«كل ساعة مذاكرة تقضيها اليوم بإخلاص، هي حجر أساس في صرح فخرك وفخر والديك غداً.»',
            source: 'زاد المتفوقين'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«أنت لست رقماً في كشف الحضور، أنت مشروع نجاح وقصة فخر تُكتب فصولها بجهدك كل يوم.»',
            source: 'رسالة لكل طالب'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«الامتحانات فُرصة لتُثبت لنفسك كم أنت عظيم وقادر على قهر الصعاب، وليست عقبة.»',
            source: 'فلسفة النجاح'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«تذكر دائماً لمعة الفرح في عيون والديك يوم تفوقك، ودعها وقوداً يضيء لك ليالي التعب.»',
            source: 'دافع الأبطال'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«الناجحون لا ينتظرون الظروف المثالية، بل يصنعون من الظروف المتاحة أروع الانتصارات.»',
            source: 'قانون التميز'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«سر التفوق ليس في العبقرية الخارقة، بل في تكرار المحاولة حين يستسلم الآخرون.»',
            source: 'درر الهمة'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«اجعل توكلك على الله كبيراً، وجهدك عظيماً، وثقتك في قدرتك لا تتزعزع أبداً.»',
            source: 'يقين النجاح'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«التعب يزول ويبقى الأثر الجميل، والسهر يمضي وتخلد لذة التفوق والوصول للقمة.»',
            source: 'بشارة لكل مجتهد'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«العلم هو السلاح الوحيد الذي كلما استخدمته ازددت قوة، ولا ينفد رصيده أبداً.»',
            source: 'حكمة العارفين'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«خطوتك الصغيرة اليوم في درسك هي التي تصنع قفزتك الكبرى يوم إعلان النتيجة.»',
            source: 'بوصلة الطالب'
        },
        {
            category: 'wisdom',
            badge: '💡 درّة اليوم',
            icon: 'fa-solid fa-lightbulb',
            color: '#EC4899',
            text: '«كن واثقاً أن الله لا يضيع أجر قطرة عرق سالت وأنت تسعى نحو مستقبل أفضل.»',
            source: 'وعد الصادقين'
        }
    ];

    const QuotesEngine = {
        database: QUOTES_DATABASE,

        getRandom(category) {
            let list = QUOTES_DATABASE;
            if (category) {
                list = QUOTES_DATABASE.filter(q => q.category === category);
                if (list.length === 0) list = QUOTES_DATABASE;
            }
            const idx = Math.floor(Math.random() * list.length);
            return list[idx];
        },

        renderWidget(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            let currentQuote = this.getRandom();

            container.innerHTML = `
                <div class="quotes-card-widget" id="quotesWidgetInner" style="
                    background: linear-gradient(135deg, rgba(14, 20, 36, 0.92) 0%, rgba(20, 29, 52, 0.88) 100%);
                    border: 1px solid rgba(245, 158, 11, 0.28);
                    border-radius: 18px;
                    padding: 16px 16px 14px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
                    position: relative;
                    margin-top: 16px;
                    transition: all 0.3s ease;
                    text-align: center;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <span id="qwBadge" style="
                            font-size: 11px;
                            font-weight: 800;
                            color: ${currentQuote.color};
                            background: rgba(255,255,255,0.05);
                            border: 1px solid rgba(255,255,255,0.1);
                            padding: 3px 10px;
                            border-radius: 20px;
                            display: inline-flex;
                            align-items: center;
                            gap: 5px;
                        ">
                            <i class="${currentQuote.icon}"></i> <span id="qwBadgeText">${currentQuote.badge}</span>
                        </span>
                        
                        <button type="button" onclick="QuotesEngine.nextQuote()" style="
                            background: transparent;
                            border: 1px solid rgba(255,255,255,0.12);
                            color: #94A3B8;
                            border-radius: 14px;
                            padding: 3px 9px;
                            font-size: 11px;
                            font-weight: 700;
                            font-family: 'Cairo', sans-serif;
                            cursor: pointer;
                            display: inline-flex;
                            align-items: center;
                            gap: 4px;
                            transition: all 0.2s;
                        " onmouseover="this.style.color='#FFFFFF'; this.style.borderColor='#F59E0B';" onmouseout="this.style.color='#94A3B8'; this.style.borderColor='rgba(255,255,255,0.12)';">
                            <span>درّة أخرى</span> <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                    </div>

                    <div id="qwText" style="
                        font-size: 13.5px;
                        font-weight: 800;
                        color: #F8FAFC;
                        line-height: 1.65;
                        margin: 6px 0;
                        min-height: 42px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: opacity 0.25s ease, transform 0.25s ease;
                    ">
                        ${currentQuote.text}
                    </div>

                    <div id="qwSource" style="
                        font-size: 11.5px;
                        color: #F59E0B;
                        font-weight: 700;
                        margin-top: 4px;
                        transition: opacity 0.25s ease;
                    ">
                        — ${currentQuote.source}
                    </div>
                </div>
            `;

            // Auto-rotate every 10 seconds smoothly
            if (window._quoteInterval) clearInterval(window._quoteInterval);
            window._quoteInterval = setInterval(() => {
                QuotesEngine.nextQuote();
            }, 10000);
        },

        nextQuote() {
            const quote = this.getRandom();
            const textEl = document.getElementById('qwText');
            const sourceEl = document.getElementById('qwSource');
            const badgeEl = document.getElementById('qwBadge');
            const badgeTextEl = document.getElementById('qwBadgeText');

            if (!textEl || !sourceEl) return;

            textEl.style.opacity = '0';
            textEl.style.transform = 'scale(0.96)';
            sourceEl.style.opacity = '0';

            setTimeout(() => {
                textEl.innerHTML = quote.text;
                sourceEl.innerHTML = '— ' + quote.source;
                if (badgeEl && badgeTextEl) {
                    badgeEl.style.color = quote.color;
                    badgeEl.querySelector('i').className = quote.icon;
                    badgeTextEl.textContent = quote.badge;
                }
                textEl.style.opacity = '1';
                textEl.style.transform = 'scale(1)';
                sourceEl.style.opacity = '1';
            }, 220);
        },

        /**
         * 👑 Shows a magnificent motivational welcome modal upon successful login!
         */
        showLoginSuccessModal(studentName, onComplete) {
            const quote = this.getRandom();
            const cleanName = studentName || 'طالبنا المتميز';

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: `<div style="font-size: 19px; font-weight: 900; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <span>مرحباً بك يا ${cleanName}</span> 🌟
                            </div>`,
                    html: `
                        <div style="margin-top: 8px; text-align: center; direction: rtl;">
                            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #FBBF24; font-size: 11.5px; font-weight: 800; padding: 4px 14px; border-radius: 20px; margin-bottom: 12px;">
                                <i class="${quote.icon}"></i> <span>${quote.badge}</span>
                            </div>

                            <div style="background: rgba(14, 20, 36, 0.7); border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 16px 14px; margin-bottom: 12px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                                <div style="font-size: 15px; font-weight: 900; color: #F8FAFC; line-height: 1.7; font-family: 'Cairo', sans-serif;">
                                    ${quote.text}
                                </div>
                                <div style="font-size: 12px; color: #F59E0B; font-weight: 800; margin-top: 8px;">
                                    — ${quote.source}
                                </div>
                            </div>

                            <p style="font-size: 13px; color: #94A3B8; font-weight: 700; margin: 0 0 14px 0; line-height: 1.6;">
                                خطوتك الأولى لصناعة مستقبلك تبدأ الآن.. نسأل الله لك التوفيق والسداد والدرجات العلا دائماً 🚀
                            </p>

                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: #38BDF8; font-weight: 800;">
                                <i class="fa-solid fa-circle-notch fa-spin"></i>
                                <span>جاري نقلك للمنصة التعليمية...</span>
                            </div>
                        </div>
                    `,
                    background: '#090D16',
                    color: '#FFFFFF',
                    showConfirmButton: true,
                    confirmButtonText: 'انطلق الآن 🚀',
                    confirmButtonColor: '#F59E0B',
                    timer: 3200,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    customClass: {
                        popup: 'swal2-border-gold'
                    }
                }).then(() => {
                    if (typeof onComplete === 'function') onComplete();
                });
            } else {
                if (typeof onComplete === 'function') onComplete();
            }
        }
    };

    window.QuotesEngine = QuotesEngine;
})(window);
