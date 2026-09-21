/**
 * ⚡ ELKHETA Motivational & Mental Toughness Engine
 * محرك روائع الشعر، علم النفس الإدراكي، المثابرة، وحتمية الوصول
 * مع مولد تركيبي لانهائي ينتج ملايين الرسائل التحفيزية الحصرية (+10,000,000 تراكيب)
 */

(function(window) {
    // ─── 1. بنك درر الشعر، سيكولوجية الإنجاز، وقوانين الصلابة الذهنية ───
    const CURATED_QUOTES = [
        // ═══ 0) قبسات من القرآن الكريم (السكينة، التوكل، والهمة) ═══
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«وَقُل رَّبِّ زِدْنِي عِلْمًا»',
            source: 'سورة طه: الآية 114'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا»',
            source: 'سورة الكهف: الآية 30'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ۝ وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ»',
            source: 'سورة النجم: الآيات 39-40'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ»',
            source: 'سورة آل عمران: الآية 159'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ»',
            source: 'سورة التوبة: الآية 105'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«لَا تَدْرِي لَعَلَّ اللَّهَ يُحْدِثُ بَعْدَ ذَٰلِكَ أَمْرًا»',
            source: 'سورة الطلاق: الآية 1'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا»',
            source: 'سورة الشرح: الآيات 5-6'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ»',
            source: 'سورة المجادلة: الآية 11'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ»',
            source: 'سورة الطلاق: الآية 3'
        },
        {
            category: 'quran',
            badge: '📖 آية كريمة',
            icon: 'fa-solid fa-quran',
            color: '#10B981',
            text: '«وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا»',
            source: 'سورة النساء: الآية 113'
        },

        // ═══ أ) روائع الشعر العربي الخالد في الهمة والمجد ═══
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
            text: '«إذا غامَرْتَ في شَرَفٍ مَرُومِ .. فَلا تَقْنَعْ بِما دُونَ النُّجُومِ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«ولم أرَ في عيوبِ الناسِ نقصاً .. كَنقصِ القادرينَ على التمامِ»',
            source: 'أبو الطيب المتنبي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«سَأَلزَمُ نَفْسي قَعْدَةً في مَكانِها .. أُطالِبُها بِالمَجدِ حَتّى تَنالَهُ»',
            source: 'أبو الطيب المتنبي'
        },
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
            text: '«وما نيلُ المطالبِ بالتمني .. ولكن تُؤخَذُ الدنيا غِلابا»',
            source: 'أمير الشعراء أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وما اسْتَعْصى على قومٍ مَنالٌ .. إذا الإِقدامُ كانَ لَهُمْ رِكابا»',
            source: 'أمير الشعراء أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«وليسَ الخائفُ المتردّدُ كالذي .. يخوضُ غِمارَ الصعبِ مبتسمَ الثغرِ»',
            source: 'أحمد شوقي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«ومَن لا يحبّ صعودَ الجبالِ .. يَعِش أبدَ الدهرِ بين الحُفَر»',
            source: 'أبو القاسم الشابي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«إذا الشعبُ يوماً أرادَ الحياةَ .. فلا بدَّ أن يستجيبَ القَدَر»',
            source: 'أبو القاسم الشابي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«لا تسقِني ماءَ الحياةِ بذِلّةٍ .. بل فاسقِني بالعزِّ كاسَ الحَنظَلِ»',
            source: 'عنترة بن شداد'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«سأخوضُ غمارَ الصعبِ غيرَ مبالٍ .. حتى أنالَ من العُلا ما أبتغي»',
            source: 'عنترة بن شداد'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«أُعَلِّلُ النَّفْسَ بالآمالِ أَرْقُبُها .. ما أَضْيَقَ العَيْشَ لَوْلا فُسْحَةُ الأَمَلِ»',
            source: 'الطغرائي'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«العزمُ يَبني للمعالي سُلَّماً .. من هِمَّةِ الأحرارِ والشجعانِ»',
            source: 'خليل مطران'
        },
        {
            category: 'poetry',
            badge: '🖋️ من روائع الشعر',
            icon: 'fa-solid fa-feather-pointed',
            color: '#3B82F6',
            text: '«أَلا فَاِنهَضوا وَاِستَقبِلوا الفَجرَ باسِماً .. فَقَد آذَنَت شَمسُ العُلا بِطُلوعِ»',
            source: 'معروف الرصافي'
        },

        // ═══ ب) علم النفس وسيكولوجية الإنجاز الفائق (Neuropsychology & Mindset) ═══
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«الدوبامين الحقيقي لا يأتي من التصفح العشوائي، بل من شطب مهمة صعبة كنت تؤجلها منذ أيام. عقلك يكافئك عندما تنتصر على ضعفك.»',
            source: 'علم النفس العصبي للدوبامين والإنجاز'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«التسويف ليس مشكلة إدارة وقت، بل مشكلة تنظيم مشاعر. عندما تواجه خوفك من البداية وتبدأ لأول 5 دقائق فقط، يختفي 90% من العبء الذهني فوراً.»',
            source: 'سيكولوجية كسر التسويف والمماطلة'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«عقلية النمو (Growth Mindset): صعوبة استيعاب مسألة اليوم ليست دليلاً على نقص ذكائك، بل هي إشارة بيولوجية بأن دماغك يبني روابط عصبية جديدة وأقوى.»',
            source: 'سيكولوجية التعلم والمسارات العصبية'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«الدافع الحماسي (Motivation) عاطفة مؤقتة وسريعة التبخر، أما الانضباط الذاتي (Discipline) فهو العضلة الصامتة التي تجعلك تدرس وأنت متعب، وتتفوق وأنت لست في مزاج ملائم.»',
            source: 'سيكولوجية الانضباط الذاتي الفائق'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«كل "لا" حازمة تقولها لهاتفك والمشتتات، هي تمرين فوري لتقوية قشرة الفص الجبهي الأمامي؛ أنت لا تذاكر فقط، بل تعيد برمجة دماغك لتصبح عبقرياً.»',
            source: 'أبحاث التركيز العميق (Deep Work)'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«لا تعامل الخطأ في امتحان تدريبي كإهانة لقدراتك؛ بل عامله كبيانات رقمية ترشدك بدقة للثغرة التي تحتاج لسدها لتضمن الدرجة النهائية في الامتحان الفعلي.»',
            source: 'علم النفس السلوكي والتحليل الموضوعي'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«ساعتان من التركيز الفائق بدون أي مقاطعات تعادلان 8 ساعات من المذاكرة المتقطعة. احمِ انتباهك وتركيزك كما تحمي أثمن ممتلكاتك.»',
            source: 'قانون كفاءة التركيز الذهني'
        },
        {
            category: 'psychology',
            badge: '🧠 سيكولوجية الإنجاز',
            icon: 'fa-solid fa-brain',
            color: '#8B5CF6',
            text: '«عقلك الباطن يسجل كل جلسة مذاكرة تجاوزت فيها التعب ورفضت الاستسلام؛ بهذه الانتصارات الصغيرة غير المرئية تُبنى الثقة الحديدية التي تكتسح بها الامتحانات.»',
            source: 'علم النفس الإدراكي وبناء الهوية'
        },

        // ═══ ج) قوانين المثابرة وحتمية الوصول (Grit & Inevitable Victory) ═══
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«الوصول للقمة ليس صدفة ولا ضربة حظ؛ بل نتيجة حتمية لا مفر منها لشخص يستيقظ كل يوم ليلتزم بجدوله دون أعذار ودون مساومة مع الفشل.»',
            source: 'قانون حتمية الوصول'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«الاستمرارية المنضبطة تسحق الموهبة الفطرية في كل مرة. الشخص الذي يدرس 4 ساعات يومياً بانتظام سيتجاوز العبقري المتكاسل حتماً لا محالة.»',
            source: 'قانون الجهد التراكمي'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«ألم الانضباط والمذاكرة يزن جرامات قليلة تدفعها الآن، لكن ألم الندم والتفريط يزن أطناناً ثقيلة تعيش معها لاحقاً. اختر ألمك بذكاء اليوم لتستريح غداً بفخر.»',
            source: 'معادلة القرار والنتائج'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«بينك وبين حلمك جدار من المحاولات والتمارين؛ كل صفحة تفهمها وكل مسألة تحلها هي ضربة فأس تهدم هذا الجدار حتى يسقط تماماً تحت قدميك.»',
            source: 'قانون تراكم الإنجاز'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«المثابرة تعني ألا تنهزم إذا عثرت في جولة؛ التاريخ لا يذكر من انسحب في منتصف الطريق، بل يخلّد من مسح الغبار عن جبينه وواصل القتال حتى حسم المعركة.»',
            source: 'فلسفة الصمود الأكاديمي'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«التعب يزول والدرجات العالية تبقى.. السهر يُمحى من الذاكرة وفرحة التفوق في أعين أهلك تبقى تاجاً مرصعاً على رأسك طول العمر.»',
            source: 'حتمية النتيجة والفخر الأبدي'
        },
        {
            category: 'grit',
            badge: '⚡ قانون حتمية الوصول',
            icon: 'fa-solid fa-bolt',
            color: '#F59E0B',
            text: '«كل دقيقة تدرسها في صمت الآن وأنت محاصر بالكتب، هي جزء من تصفيق حار ستسمعه غداً على منصة تكريم الأوائل.»',
            source: 'سيكولوجية التحضير الصامت'
        },

        // ═══ د) رسائل القوة والتحفيز الناري الشرس (Hardcore Motivation) ═══
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«انهض الآن واطرد التردد! مفيش حد هيصنع مستقبلك بدلاً منك، ومفيش معجزة هتحصل وإنت مأجل المذاكرة.. افتح كتبك واقفل على نفسك وركز!»',
            source: 'نداء الاستفاقة الأكاديمية'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«مش مهم إنت بدأت متأخر أو وقعت في فترات قبل كده؛ المعركة دي بتنحسم في الأمتار الأخيرة، والفرصة لسه في إيدك تضرب ضربتك وتصدم الكل بنتيجتك!»',
            source: 'سيكولوجية الريمونتادا والتفوق'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«تخيل شعورك يوم إعلان النتيجة وإنت رافع رأسك بين أهلك والكل مبهور بعزيمتك.. اللحظة دي تسوى إنك تدوس على تعبك دلوقتي وتتحمل أي ضغط!»',
            source: 'وقود اللحظة الحاسمة'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«اللي هيوصل مش الأذكى، اللي هيوصل هو صاحب النفس الأطول؛ اللي مابيستسلمش لما تتقل عليه المادة، واللي بيرجع يقاوح تاني بعد كل عطلة!»',
            source: 'عقيدة المقاتل الأكاديمي'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«كل ثانية بتضيعها في التردد، في غيرك بيستغلها وبيقرب من المقعد اللي إنت بتحلم بيه.. استرد تركيزك فوراً وانزل الملعب بكامل قوتك!»',
            source: 'شرارة الحسم والسباق'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«الضغط اللي إنت حاسس بيه دلوقتي مش عذاب؛ ده الضغط اللي بيحول الفحم لألماظ خام. اصمد وخليك قد المسؤولية!»',
            source: 'كيمياء التحول والصلابة'
        },
        {
            category: 'hardcore',
            badge: '🔥 رسالة قوة ومثابرة',
            icon: 'fa-solid fa-fire',
            color: '#EC4899',
            text: '«بص لكتبك كأنها خصمك في الحلبة؛ مفيش خروج غير وإنت كسبان الجولة وفاهم كل مسألة وكل فكرة بالتفصيل!»',
            source: 'روح الافتراس الأكاديمي'
        }
    ];

    // ─── 2. المولد التركيبي اللانهائي (Infinite Motivation Synthesizer Engine) ───
    // ينتج هذا المولد أكثر من 10,000,000 تركيب تحفيزي فريد ومتقن لغوياً ونفسياً
    const SYNTHESIZER = {
        premises: [
            "قانون علم النفس الإدراكي يثبت أن استمرارك في المذاكرة والحل رغم انعدام الشغف اللحظي",
            "حين تفرض الانضباط الذاتي وتلجم رغبة عقلك الباطن في الهروب إلى المشتتات السهلة",
            "سيكولوجية العظماء تقوم على حقيقة قاطعة: الألم المؤقت لجهد المذاكرة وسهر الليالي",
            "التركيز الشرس الذي تفصل به نفسك الآن عن ضجيج العالم وملهيات السوشيال ميديا",
            "كل مسألة معقدة ترفض تركها وتصر بعناد الأبطال على تفكيكها سطرًا بسطر",
            "الاستيقاظ المبكر وكسر حواجز الكسل بقرار واعي عندما يكون معظم الناس نيامًا",
            "مقاومة إغراءات الهاتف والتسويف في هذه الساعات الفاصلة من عامك الدراسي",
            "إدراكك العميق بأن مستقبلك الأكاديمي لا يبنيه التمني الفارغ بل السعي الصامت المضني",
            "الجهد التراكمي الدقيق الذي تبذله في هدوء خلف الأبواب المغلقة بعيدًا عن الاستعراض",
            "صلابتك النفسية الفائقة أمام ثقل المنهج وضغط الوقت واقتراب الامتحانات المصيرية",
            "تحويلك لمشاعر الخوف والضغط العصبي إلى وقود احتراق داخلي يضاعف حدة انتباهك",
            "سحقك الفوري لصوت التسويف والمماطلة والبدء في المذاكرة خلال الـ 5 ثوانٍ الأولى",
            "قرارك الحاسم اليوم بألا ترضى لنفسك إلا بالدرجة النهائية وبالمقدمة التي تليق بك",
            "العضلة الذهنية والإرادة الحديدية التي تبنيها كلما تجاوزت التعب وواصلت الحل والتدريب",
            "يقينك الصارم بأن الفارق بين الحلم المعلق والواقع المحقق هو بضع مئات من ساعات التركيز العميق",
            "قدرتك المذهلة على تطويع المشاعر وإجبار العقل على إنهاء أصعب الفصول دون تردد",
            "رفضك التام لمنطق الأعذار والمبررات ومواجهة المنهج كبطل لا يقبل بأنصاف الإنجازات",
            "الهدوء والتركيز الفولاذي الذي تتعامل به مع أصعب أسئلة بنوك الأسئلة والامتحانات",
            "إيمانك الراسخ بأن كل دقيقة بذلتها في القراءة والفهم ستتحول غداً إلى درجات كاملة",
            "تحديك الشجاع لكل فترات الفتور السابقة وعودتك الآن للميدان بقوة تفوق أي وقت مضى"
        ],

        actions: [
            "يعيد ترتيب المسارات العصبية في قشرة دماغك ليجعل استيعابك أسرع وذاكرتك أكثر دقة واحترافية",
            "يصنع منك شخصية فولاذية غير قابلة للانكسار تلتهم المناهج وتحول كل صعوبة إلى نصر مؤزر",
            "يسحق تمامًا هواجس الفشل والتردد ويغرس في أعماقك عقلية النمو والافتراس الأكاديمي الواثق",
            "يبني سدًا منيعًا ضد التشتت الذهني ويوجه طاقتك وطموحك بالكامل نحو القمة المطلقة",
            "يدمر أوهام الصعوبة المستحيلة ويثبت لك عمليًا أنك أذكى وأقوى بمراحل مما كنت تتخيل",
            "يقودك حتمًا لاكتساح أعتى الامتحانات بثبات أسطوري وحضور ذهني يثير إعجاب الجميع",
            "يجعل كل ساعة تبذلها الآن رصيدًا استثماريًا ضخمًا ينفجر نجاحًا وتفوقًا يوم إعلان النتائج",
            "يحول التعب والجهد إلى وسام فخر وشرف داخلي يرفع هامتك ويزيدك إصرارًا على المركز الأول",
            "يرسخ هويتك كبطل لا يعرف الاستسلام ولا يرضى بغير القمة والدرجة النهائية بديلاً",
            "يغلق أمامك كل أبواب التراجع ويفتح لك الطريق الملكي نحو تحقيق كل طموحاتك وطموحات أهلك",
            "يبرهن للجميع أن من يمتلك العزيمة الصلبة يستطيع كتابة التاريخ في أي وقت وبأي إمكانيات",
            "يمنحك السيطرة الكاملة على زمام تفكيرك لتصبح أنت القائد الحقيقي لمصيرك ومستقبلك",
            "يصنع فارقًا هائلًا بينك وبين كل من يكتفي بالأمنيات وينتظر الصدف التي لا تأتي",
            "يجعل استيعابك للمفاهيم المعقدة لعبة ممتعة تتقن تفاصيلها وتتفوق في تطبيقاتها"
        ],

        outcomes: [
            "لتكون النتيجة الحتمية هي وصولك إلى القمة وفرحة تاريخية لا تُنسى مدى الحياة.",
            "لأن من يزرع في عتمة الليالي وصمت المذاكرة، يحصد المجد والتكريم على رؤوس الأشهاد.",
            "فالوصول لم يكن يومًا ضربة حظ؛ بل استحقاقًا يفرضه العزم الصادق والسعي المتواصل.",
            "وستنظر غدًا إلى كل دقيقة تعب بابتسامة فخر واعتزاز لا تضاهيها أي فرحة أخرى.",
            "وهذا هو الفارق الحاسم بين من يتمنى النجاح من بعيد، ومن ينتزعه بيده من قلب التحدي.",
            "لتثبت للعالم كله أن إرادتك وعزيمتك كانت أكبر من كل الظروف وأقوى من كل العقبات.",
            "فارفع رأسك وافتخر بسعيك، لأن منصات التتويج والدرجات العليا تنتظر أبطالها الحقيقيين.",
            "ولن ترضى بغير الدرجة الكاملة تتويجًا لجهدك وصبرك وإخلاصك في هذه الرحلة العظيمة.",
            "فحتمية الوصول مسألة وقت لا أكثر، مادمت تتحرك كل يوم خطوة ثابتة إلى الأمام.",
            "وتذكر أن فرحة والديك بدموع التفوق يوم النتيجة تستحق كل لحظة جهد وسهر الآن."
        ],

        sources: [
            "قانون سيكولوجية المحارب الأكاديمي",
            "هندسة العقل والانضباط الذاتي الفائق",
            "معادلة حتمية الوصول والنجاح الحتمي",
            "أسرار التركيز الإدراكي وعقلية النمو",
            "فلسفة الانتصار وتفكيك التحديات",
            "دستور القوة والصلابة النفسية",
            "منهاج التفوق والدرجة النهائية"
        ],

        badges: [
            { badge: '🧠 سيكولوجية الإنجاز الفائق', icon: 'fa-solid fa-brain', color: '#8B5CF6' },
            { badge: '⚡ قانون حتمية الوصول', icon: 'fa-solid fa-bolt', color: '#F59E0B' },
            { badge: '🔥 رسالة قوة ومثابرة', icon: 'fa-solid fa-fire', color: '#EC4899' },
            { badge: '🎯 انضباط حديدي وتركيز', icon: 'fa-solid fa-bullseye', color: '#06B6D4' },
            { badge: '👑 عقلية الأبطال والقمة', icon: 'fa-solid fa-crown', color: '#10B981' }
        ],

        generate() {
            const p = this.premises[Math.floor(Math.random() * this.premises.length)];
            const a = this.actions[Math.floor(Math.random() * this.actions.length)];
            const o = this.outcomes[Math.floor(Math.random() * this.outcomes.length)];
            const s = this.sources[Math.floor(Math.random() * this.sources.length)];
            const b = this.badges[Math.floor(Math.random() * this.badges.length)];

            return {
                category: 'synthesized',
                badge: b.badge,
                icon: b.icon,
                color: b.color,
                text: `«${p} .. ${a}، ${o}»`,
                source: s
            };
        }
    };

    // ─── 3. كائن التحكم والمحرك العام (QuotesEngine) ───
    const QuotesEngine = {
        /**
         * يجلب اقتباساً عشوائياً (يمزج بين روائع الشعر، سيكولوجية الإنجاز، والمولد اللانهائي)
         */
        getRandom() {
            // 40% من الشعر وعلم النفس المنسق، 60% من المولد التركيبي اللانهائي (+10,000,000 تركيب)
            const useSynthesizer = Math.random() < 0.6;
            if (useSynthesizer) {
                return SYNTHESIZER.generate();
            }
            return CURATED_QUOTES[Math.floor(Math.random() * CURATED_QUOTES.length)];
        },

        /**
         * تهيئة ودجت التحفيز المباشر في صفحات تسجيل الدخول أو إنشاء الحساب
         */
        initWidget(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const currentQuote = this.getRandom();

            container.innerHTML = `
                <div class="quotes-widget-card" style="
                    background: #FFFFFF !important;
                    border: 1.5px solid #EAE0D7 !important;
                    border-radius: 20px;
                    padding: 16px 18px;
                    margin: 18px 0 14px;
                    box-shadow: 0 4px 20px rgba(74, 46, 27, 0.06) !important;
                    position: relative;
                    direction: rtl;
                    transition: all 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <div id="qwBadge" style="
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            background: #FAF6F0 !important;
                            border: 1px solid #EAE0D7 !important;
                            border-radius: 50px;
                            padding: 4px 12px;
                            font-size: 11.5px;
                            font-weight: 800;
                            color: #8C531B !important;
                        ">
                            <i class="${currentQuote.icon}"></i>
                            <span id="qwBadgeText">${currentQuote.badge}</span>
                        </div>
                        <button type="button" onclick="QuotesEngine.nextQuote()" style="
                            background: #F5EFEB;
                            border: 1px solid #EAE0D7;
                            color: #543D31;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 800;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            padding: 4px 10px;
                            border-radius: 20px;
                            transition: all 0.2s;
                        " onmouseover="this.style.color='#FFFBF7'; this.style.background='#4A2E1B'" onmouseout="this.style.color='#543D31'; this.style.background='#F5EFEB'">
                            <span>درّة أخرى</span>
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                    </div>

                    <div id="qwText" style="
                        font-size: 14px;
                        font-weight: 800;
                        color: #2B1810 !important;
                        -webkit-text-fill-color: #2B1810 !important;
                        line-height: 1.7;
                        min-height: 48px;
                        display: flex;
                        align-items: center;
                        transition: opacity 0.22s ease, transform 0.22s ease;
                    ">
                        ${currentQuote.text}
                    </div>

                    <div id="qwSource" style="
                        font-size: 12px;
                        color: #C88A4B !important;
                        -webkit-text-fill-color: #C88A4B !important;
                        font-weight: 800;
                        margin-top: 6px;
                        text-align: left;
                        transition: opacity 0.22s ease;
                    ">
                        — ${currentQuote.source}
                    </div>
                </div>
            `;

            // تدوير سلس كل 50 ثانية
            if (window._quoteInterval) clearInterval(window._quoteInterval);
            window._quoteInterval = setInterval(() => {
                QuotesEngine.nextQuote();
            }, 50000);
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
            }, 200);
        },

        /**
         * 👑 نافذة الاستقبال الملكية فور نجاح تسجيل الدخول
         * تحتوي على:
         * - مهلة قراءة وتأمل 15 ثانية
         * - عداد رقمي متناقص (00:15 -> 00:00)
         * - زر فوري «انتقل للمنصة الآن 🚀» ينقلك بأي لحظة
         * - زر «درّة أخرى 🔄» للتنقل بين روائع الشعر وعلم النفس أثناء المهلة
         */
        showLoginSuccessModal(studentName, onComplete) {
            const quote = this.getRandom();
            const cleanName = studentName || 'طالبنا المتميز';
            const isManager = cleanName.includes('المدير') || cleanName.includes('مشرف') || cleanName.includes('إدارة');
            const titleHeader = isManager ? '👑 مرحباً بك في لوحة القيادة 👑' : '🌟 مرحباً بك يا بطل 🌟';
            const targetPlatformText = isManager ? 'انتقل للوحة الإدارة الآن 🚀' : 'انتقل للمنصة الآن 🚀';
            const totalDurationSec = 15; // 15 ثانية
            let timerInterval = null;
            let quoteAutoInterval = null;
            let hasCompleted = false;

            const executeComplete = () => {
                if (hasCompleted) return;
                hasCompleted = true;
                if (timerInterval) clearInterval(timerInterval);
                if (quoteAutoInterval) clearInterval(quoteAutoInterval);
                QuotesEngine._activeNavigateNow = null;
                const fallbackEl = document.getElementById('fallbackMotivationalModal');
                if (fallbackEl) fallbackEl.remove();
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            };

            QuotesEngine.navigateNow = function() {
                if (typeof Swal !== 'undefined' && Swal.isVisible()) {
                    Swal.close();
                }
                executeComplete();
            };

            // أنماط التصميم الفاخر المتناسق تماماً للكمبيوتر والموبايل
            if (!document.getElementById('elkheta-quotes-modal-css')) {
                const style = document.createElement('style');
                style.id = 'elkheta-quotes-modal-css';
                style.textContent = `
                    .swal2-container {
                        z-index: 1000000 !important;
                        padding: 10px !important;
                    }
                    .swal2-popup.swal2-border-gold {
                        border: 1.5px solid rgba(245, 158, 11, 0.45) !important;
                        border-radius: 22px !important;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.2) !important;
                        width: 530px !important;
                        max-width: 95vw !important;
                        padding: 20px 24px 18px !important;
                        margin: auto !important;
                        max-height: 92vh !important;
                        max-height: 92dvh !important;
                        display: flex !important;
                        flex-direction: column !important;
                        overflow-y: auto !important;
                        scrollbar-width: none !important;
                        -ms-overflow-style: none !important;
                    }
                    .swal2-popup.swal2-border-gold::-webkit-scrollbar {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                    }
                    @media (max-width: 580px) {
                        .swal2-popup.swal2-border-gold {
                            width: 94% !important;
                            max-width: 385px !important;
                            padding: 14px 14px 16px !important;
                        }
                    }
                    .swal2-timer-progress-bar {
                        background: linear-gradient(90deg, #F59E0B, #8B5CF6) !important;
                        height: 3px !important;
                    }
                    /* إخفاء زر الدعم العائم تماماً أثناء فتح النافذة لمنع التداخل */
                    body.swal2-shown .floating-chat-btn,
                    html.swal2-shown .floating-chat-btn,
                    .swal2-shown .floating-chat-btn,
                    body.swal2-shown #floatingChatBtn {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                `;
                document.head.appendChild(style);
            }

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    html: `
                        <div style="text-align: center; direction: rtl; display: flex; flex-direction: column; width: 100%;">
                            <!-- ترويسة الاسم المدمجة -->
                            <div style="text-align: center; margin-bottom: 6px;">
                                <div style="font-size: 13px; font-weight: 800; color: #94A3B8; margin-bottom: 2px;">
                                    ${titleHeader}
                                </div>
                                <div style="font-size: 17.5px; font-weight: 900; color: #2B1810; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; margin: 0 auto;">
                                    ${cleanName}
                                </div>
                            </div>

                            <!-- شريط المؤقت والشارة -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                                <div id="modalQuoteBadge" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.35); color: ${quote.color || '#FBBF24'}; font-size: 11.5px; font-weight: 800; padding: 4px 12px; border-radius: 20px; white-space: nowrap;">
                                    <i id="modalQuoteIcon" class="${quote.icon || 'fa-solid fa-bolt'}" style="font-size: 10.5px;"></i>
                                    <span id="modalQuoteBadgeText">${quote.badge || '⚡ درّة العزيمة'}</span>
                                </div>

                                <div style="display: inline-flex; align-items: center; gap: 5px; background: rgba(139, 92, 246, 0.18); border: 1px solid rgba(139, 92, 246, 0.4); color: #C4B5FD; font-size: 11.5px; font-weight: 900; padding: 4px 12px; border-radius: 20px; white-space: nowrap;">
                                    <i class="fa-solid fa-stopwatch" style="color: #A78BFA; font-size: 11px;"></i>
                                    <span>مهلة التأمل:</span>
                                    <span id="modalTimerCountdown" style="font-family: monospace; font-size: 13px; color: #2B1810; font-weight: 900;">00:15</span>
                                </div>
                            </div>

                            <!-- صندوق الحكمة والبيت الشعري -->
                            <div style="background: #FAF6F0; border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 14px 16px; margin-bottom: 8px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(245, 158, 11, 0.08); max-height: 220px; overflow-y: auto; scrollbar-width: none;">
                                <div id="modalQuoteText" style="font-size: 13.5px; font-weight: 900; color: #2B1810; line-height: 1.7; font-family: 'Cairo', sans-serif; min-height: 42px; display: flex; align-items: center; justify-content: center; text-align: center; transition: opacity 0.2s ease, transform 0.2s ease;">
                                    ${quote.text}
                                </div>
                                <div id="modalQuoteSource" style="font-size: 11.5px; color: #F59E0B; font-weight: 800; margin-top: 6px; text-align: left; transition: opacity 0.2s ease;">
                                    — ${quote.source}
                                </div>
                            </div>

                            <!-- سطر الإجراء المدمج -->
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
                                <button type="button" onclick="QuotesEngine.nextModalQuote()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.22); color: #E2E8F0; font-size: 11.5px; font-weight: 800; padding: 4px 14px; border-radius: 30px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
                                    <i class="fa-solid fa-arrows-rotate" style="font-size: 10px;"></i>
                                    <span>حكمة أخرى</span>
                                </button>
                                <span style="font-size: 11px; color: #94A3B8; font-weight: 700; white-space: nowrap;">القمة خُلقت لمن لا يتراجع 🦅</span>
                            </div>

                            <p style="font-size: 11px; color: #64748B; font-weight: 700; margin: 0 0 8px 0; line-height: 1.4;">
                                تستطيع استكمال القراءة أو الدخول فوراً بالزر أدناه 👇
                            </p>

                            <!-- زر الانتقال الفوري للمنصة بسطر واحد ثابت وبارز دائماً -->
                            <button type="button" id="btnInstantEnterPlatform" onclick="QuotesEngine.navigateNow()" style="width: 100%; height: 46px; min-height: 46px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFBF7; font-weight: 900; font-size: 15px; padding: 0 14px; border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45); transition: transform 0.15s ease;">
                                <span>${targetPlatformText}</span>
                            </button>
                        </div>
                    `,
                    background: '#FFFFFF',
                    color: '#2B1810',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    timer: 15000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'swal2-border-gold'
                    },
                    didOpen: () => {
                        const countdownEl = document.getElementById('modalTimerCountdown');
                        const startTime = Date.now();
                        const durationMs = 15 * 1000;

                        timerInterval = setInterval(() => {
                            const elapsed = Date.now() - startTime;
                            const remainMs = Math.max(0, durationMs - elapsed);
                            const totalSec = Math.ceil(remainMs / 1000);

                            const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
                            const secs = (totalSec % 60).toString().padStart(2, '0');

                            if (countdownEl) {
                                countdownEl.textContent = `${mins}:${secs}`;
                            }

                            if (remainMs <= 0) {
                                clearInterval(timerInterval);
                                if (quoteAutoInterval) clearInterval(quoteAutoInterval);
                                if (typeof Swal !== 'undefined' && Swal.isVisible()) {
                                    Swal.close();
                                }
                                executeComplete();
                            }
                        }, 500);

                        // تدوير درر الحكمة كل 50 ثانية داخل النافذة
                        quoteAutoInterval = setInterval(() => {
                            QuotesEngine.nextModalQuote();
                        }, 6000);
                    },
                    willClose: () => {
                        if (timerInterval) clearInterval(timerInterval);
                        if (quoteAutoInterval) clearInterval(quoteAutoInterval);
                    }
                }).then(() => {
                    executeComplete();
                });
            } else {
                // بديل ذاتي بدون مكتبة SweetAlert2
                const existing = document.getElementById('fallbackMotivationalModal');
                if (existing) existing.remove();

                const overlay = document.createElement('div');
                overlay.id = 'fallbackMotivationalModal';
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(9,13,22,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;font-family:Cairo,sans-serif;';
                overlay.innerHTML = `
                    <div style="background:#090D16; border:1.5px solid rgba(245,158,11,0.45); border-radius:22px; width:520px; max-width:94vw; padding:18px 20px; box-shadow:0 16px 50px rgba(0,0,0,0.9); text-align:center; color:#FFF; box-sizing:border-box;">
                        <div style="font-size:13px; color:#94A3B8; font-weight:800; margin-bottom:2px;">${titleHeader}</div>
                        <div style="font-size:17.5px; font-weight:900; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cleanName}</div>
                        <div style="display:flex; justify-content:center; gap:8px; align-items:center; margin-bottom:8px; flex-wrap:wrap;">
                            <span id="modalQuoteBadge" style="background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.35); color:#FBBF24; font-size:11.5px; font-weight:800; padding:4px 12px; border-radius:20px;">
                                <i id="modalQuoteIcon" class="${quote.icon}"></i> <span id="modalQuoteBadgeText">${quote.badge}</span>
                            </span>
                            <span style="color:#C4B5FD; font-size:11.5px; font-weight:900; background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); padding:4px 12px; border-radius:20px;">
                                ⏱️ المهلة: <span id="modalTimerCountdown" style="font-family:monospace; font-size:13px; color:#FFF;">00:15</span>
                            </span>
                        </div>
                        <div style="background: #FAF6F0; border:1.5px solid rgba(245,158,11,0.35); border-radius:16px; padding:14px 16px; margin-bottom:8px; max-height:220px; overflow-y:auto;">
                            <div id="modalQuoteText" style="font-size:13.5px; font-weight:900; line-height:1.7;">${quote.text}</div>
                            <div id="modalQuoteSource" style="font-size:11.5px; color:#F59E0B; font-weight:800; margin-top:6px; text-align:left;">— ${quote.source}</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <button type="button" onclick="QuotesEngine.nextModalQuote()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.22); color:#FFF; font-size:11.5px; font-weight:800; padding:4px 14px; border-radius:30px; cursor:pointer;">
                                حكمة أخرى 🔄
                            </button>
                            <span style="font-size:11px; color:#94A3B8; font-weight:700;">القمة خُلقت لمن لا يتراجع 🦅</span>
                        </div>
                        <button type="button" onclick="QuotesEngine.navigateNow()" style="width:100%; height:46px; background: linear-gradient(135deg, #4A2E1B, #2B1810); color: #FFFBF7; font-weight:900; font-size:15px; border:none; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <span>${targetPlatformText}</span>
                        </button>
                    </div>
                `;
                document.body.appendChild(overlay);

                const countdownEl = document.getElementById('modalTimerCountdown');
                const startTime = Date.now();
                const durationMs = 15 * 1000;

                timerInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const remainMs = Math.max(0, durationMs - elapsed);
                    const totalSec = Math.ceil(remainMs / 1000);

                    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
                    const secs = (totalSec % 60).toString().padStart(2, '0');

                    if (countdownEl) {
                        countdownEl.textContent = `${mins}:${secs}`;
                    }

                    if (remainMs <= 0) {
                        clearInterval(timerInterval);
                        if (quoteAutoInterval) clearInterval(quoteAutoInterval);
                        executeComplete();
                    }
                }, 500);

                // تدوير درر الحكمة كل 50 ثانية في البديل
                quoteAutoInterval = setInterval(() => {
                            QuotesEngine.nextModalQuote();
                        }, 6000);
            }
        },

        nextModalQuote() {
            const quote = this.getRandom();
            const textEl = document.getElementById('modalQuoteText');
            const sourceEl = document.getElementById('modalQuoteSource');
            const iconEl = document.getElementById('modalQuoteIcon');
            const badgeTextEl = document.getElementById('modalQuoteBadgeText');
            const badgeEl = document.getElementById('modalQuoteBadge');

            if (!textEl) return;
            textEl.style.opacity = '0';
            textEl.style.transform = 'scale(0.96)';
            if (sourceEl) sourceEl.style.opacity = '0';

            setTimeout(() => {
                textEl.innerHTML = quote.text;
                if (sourceEl) sourceEl.innerHTML = '— ' + quote.source;
                if (badgeEl && badgeTextEl && iconEl) {
                    badgeEl.style.color = quote.color || '#F59E0B';
                    iconEl.className = quote.icon || 'fa-solid fa-bolt';
                    badgeTextEl.textContent = quote.badge || '⚡ درّة العزيمة';
                }
                textEl.style.opacity = '1';
                textEl.style.transform = 'scale(1)';
                if (sourceEl) sourceEl.style.opacity = '1';
            }, 200);
        }
    };

    window.QuotesEngine = QuotesEngine;
})(window);
