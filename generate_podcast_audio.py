# -*- coding: utf-8 -*-
"""
🎙️ ELKHETA ACADEMIC PODCAST AUDIO GENERATOR
Generates authentic Egyptian Arabic teacher narration for lectures using Python & Edge-TTS.
"""

import os
import sys
import asyncio
import edge_tts

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Authentic Egyptian Colloquial Teacher Explanation for "الفصل الأول: المهارات المهنية"
TEACHER_SCRIPT_EGYPTIAN = """
أهلاً بيكم يا شباب، يا رب تكونوا بألف خير ومركزين معايا.
أنا معاكم النهارده علشان نلم ونفرم الفصل الأول في مادة طريقة العمل مع الأفراد، وهو فصل "المهارات المهنية"، وده من أهم الفصول اللي بيجي عليها أسئلة كتير في الامتحان النهائي. ركزوا بقى في الكلمتين دول علشان تطلعوا من الحصة فاهمين وحافظين كمان.

أول نقطة لازم تعرفوها: كلمة "المهارة" جاية منين؟
لغوياً، جاية من كلمة (مَهُرَ بالشيء)، يعني أحكمه وأتقنه وبقى حاذق وعليم بيه. وبالإنجليزي اسمها سكيل Skill، يعني البراعة أو تقديم الخدمة.
طب إجرائياً واقتصادياً يا بطل؟ يعني بتخلص الشغل بأقل مجهود، وأقل تكلفة، وفي أسرع وقت، وبأعلى دقة ومكسب ممكن. افتكر الأربع كلمات دول: أقل جهد، أقل تكلفة، أسرع وقت، أعلى عائد!

تاني نقطة، ودي اللي واضع الامتحان بيعشقها: تصنيف العالم "ليونبرج".
ليونبرج قسم المهارات لنوعين أساسيين:
أول نوع: "مهارات تكيفية".. ودي المهارات اللي بتخلي الأخصائي ينسجم ويتوافق مع بيئة المؤسسة اللي شغال فيها، يعني يفهم لوائحها ونظامها.
تاني نوع: "مهارات وظيفية".. ودي اللي بتتعامل مع البيانات والناس، زي حل المشكلات، وصنع القرار، والتحليل.
أوعى تتلخبط بينهم في الامتحان؛ حل المشكلات وظيفية، والتوافق مع نظام المؤسسة تكيفية!

طب المهارات بنتعلمها فين؟
المهارات العامة زي المقابلة والعلاقة المهنية والتقدير.. دي بتتعلمها في قاعات الجامعة دراسة أكاديمية.
أما المهارات الخاصة بوظيفة معينة.. فدي بتتعلمها في برامج التدريب أثناء الشغل، يعني جوه الميدان.

تالت نقطة مهمة جداً: شروط العالم "نيل طومسون" لتنمية المهارات.. طومسون حط 6 شروط بالتمام والكمال، أهمهم إن الممارس يكون عنده استعداد ذاتي للتغيير، يعني لو طريقته القديمة مش جايبة نتيجة، يتنازل عنها ويتعلم من زمايله ومن الإشراف والتعليم المستمر.

وآخر حاجة نختم بيها: ممارسة المهارة مش مطلقة.. دي عملية نسبية بتتأثر بأربع حاجات: طريقة الشغل، والمدخل النظري، ونوع المؤسسة إذا كانت مدرسة ولا مستشفى، والوقت المتاح للتدخل.

اسمعوا الكبسولة دي كويس، واستعينوا ببطاقات الفلاش كاردز والاختبارات، وبالتوفيق والدرجات النهائية يا أبطال منصة الخطة!
"""

async def generate_podcast():
    os.makedirs('audio', exist_ok=True)
    os.makedirs('www/audio', exist_ok=True)
    out_file = 'audio/podcast_skills_ch1.mp3'
    www_out = 'www/audio/podcast_skills_ch1.mp3'
    
    print(f"🎙️ Generating Egyptian Teacher Audio using 'ar-EG-ShakirNeural'...")
    communicate = edge_tts.Communicate(
        text=TEACHER_SCRIPT_EGYPTIAN.strip(),
        voice="ar-EG-ShakirNeural",
        rate="+2%",
        pitch="+0Hz"
    )
    await communicate.save(out_file)
    print(f"✅ Audio saved to {out_file} (Size: {os.path.getsize(out_file)} bytes)")
    
    # Copy to www
    import shutil
    shutil.copyfile(out_file, www_out)
    print(f"✅ Audio copied to {www_out}")
    
    try:
        android_dir = 'android/app/src/main/assets/public/audio'
        os.makedirs(android_dir, exist_ok=True)
        shutil.copyfile(out_file, os.path.join(android_dir, 'podcast_skills_ch1.mp3'))
        print(f"✅ Audio copied to Android assets")
    except Exception as e:
        pass

if __name__ == '__main__':
    asyncio.run(generate_podcast())
