package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.card.MaterialCardView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        
        val userName = intent.getStringExtra("USER_NAME") ?: "عبدالرحمن ناصر"
        val tvUserName = findViewById<TextView>(R.id.tvUserName)
        tvUserName.text = getString(R.string.welcome_user, userName)

        // عرض آخر تنبيه في شريط التنبيهات
        val tvNotice = findViewById<TextView>(R.id.tvNoticeText)
        NotificationRepository.getLatestNotification { message ->
            tvNotice.text = message
        }

        // كارت التنبيهات
        findViewById<MaterialCardView>(R.id.cardNotifications).setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }

        // كارت المواد الدراسية
        findViewById<MaterialCardView>(R.id.cardSubjects).setOnClickListener {
            startActivity(Intent(this, CoursesActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.cardMap).setOnClickListener {
            startActivity(Intent(this, CurriculumMapActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.cardMistakes).setOnClickListener {
            startActivity(Intent(this, MistakesActivity::class.java))
        }

        // تحديث لوحة الصدارة (Weekly Leaderboard)
        updateLeaderboard()

        // زر تسجيل الخروج
        findViewById<ImageView>(R.id.ivLogout).setOnClickListener {
            // مسح الجلسة وتعطيل "تذكرني"
            SessionManager.clear(this)

            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            Toast.makeText(this, getString(R.string.logged_out), Toast.LENGTH_SHORT).show()
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topView)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            insets
        }
    }

    private fun updateLeaderboard() {
        val tvName1 = findViewById<TextView>(R.id.tvLeaderName1)
        val tvPoints1 = findViewById<TextView>(R.id.tvLeaderPoints1)
        val tvName2 = findViewById<TextView>(R.id.tvLeaderName2)
        val tvPoints2 = findViewById<TextView>(R.id.tvLeaderPoints2)

        StudentRepository.getTopStudents(2) { topStudents ->
            if (topStudents.size >= 1) {
                tvName1.text = "1. ${topStudents[0].fullName}"
                tvPoints1.text = "${topStudents[0].points} نقطة"
            }
            if (topStudents.size >= 2) {
                tvName2.text = "2. ${topStudents[1].fullName}"
                tvPoints2.text = "${topStudents[1].points} نقطة"
            }
        }
    }
}
