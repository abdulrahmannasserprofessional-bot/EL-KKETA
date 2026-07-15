package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class NotificationsActivity : androidx.appcompat.app.AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notifications)

        findViewById<ImageView>(R.id.btnBackNotif).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvNotifications)
        rv.layoutManager = LinearLayoutManager(this)

        // جلب التنبيهات من المستودع (حالياً سنعرض التنبيه الأخير مكرر كمثال، أو يمكن تعديل المستودع لاحقاً)
        NotificationRepository.getLatestNotification { message ->
            val list = listOf(message, "أهلاً بك في منصة الخطة التعليمية", "تم إضافة محاضرات جديدة في مادة الفيزياء")
            rv.adapter = NotificationAdapter(list)
        }
    }
}
