package com.example.elkheta

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class TutorialActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tutorial)

        findViewById<ImageView>(R.id.btnBackTutorial).setOnClickListener { finish() }

        val rvTutorial = findViewById<RecyclerView>(R.id.rvTutorial)
        rvTutorial.layoutManager = LinearLayoutManager(this)

        val tutorialList = listOf(
            TutorialItem(
                "كيفية إنشاء حساب",
                "شرح مفصل لخطوات تسجيل حساب جديد في المنصة لأول مرة.",
                "https://www.youtube.com/watch?v=example1",
                android.R.drawable.ic_menu_add
            ),
            TutorialItem(
                "تسجيل الدخول",
                "كيفية الدخول لحسابك وتخطي مشاكل نسيان كلمة السر.",
                "https://www.youtube.com/watch?v=example2",
                android.R.drawable.ic_lock_idle_lock
            ),
            TutorialItem(
                "الاشتراك في المواد",
                "طريقة الوصول للمواد التعليمية وتفعيل الأكواد الخاصة بك.",
                "https://www.youtube.com/watch?v=example3",
                android.R.drawable.ic_menu_agenda
            ),
            TutorialItem(
                "خريطة المنهج والامتحانات",
                "كيفية متابعة تقدمك وحل الاختبارات الإلكترونية.",
                "https://www.youtube.com/watch?v=example4",
                android.R.drawable.ic_menu_edit
            )
        )

        rvTutorial.adapter = TutorialAdapter(tutorialList) { item ->
            if (item.videoUrl.isNotEmpty()) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(item.videoUrl))
                startActivity(intent)
            }
        }
    }
}
