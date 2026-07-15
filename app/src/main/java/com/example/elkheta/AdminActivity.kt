package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView

class AdminActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin)

        // إخفاء رسالة الترحيب بعد 2 ثانية
        val cardWelcome = findViewById<MaterialCardView>(R.id.cardWelcomeAdmin)
        cardWelcome.postDelayed({
            cardWelcome.animate()
                .alpha(0f)
                .setDuration(500)
                .withEndAction { cardWelcome.visibility = View.GONE }
        }, 2000)

        // الربط بين الأزرار والصفحات الجديدة
        findViewById<MaterialCardView>(R.id.btnManageStudents).setOnClickListener {
            startActivity(Intent(this, ManageStudentsActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnManageSubjects).setOnClickListener {
            startActivity(Intent(this, ManageSubjectsActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnUploadContent).setOnClickListener {
            startActivity(Intent(this, UploadExamActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnManageCodes).setOnClickListener {
            startActivity(Intent(this, ManageCodesActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnNotifications).setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnSystemConfig).setOnClickListener {
            startActivity(Intent(this, SystemConfigActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.btnActivatedCodes).setOnClickListener {
            startActivity(Intent(this, ActivatedCodesActivity::class.java))
        }

        // زر الرجوع
        findViewById<ImageView>(R.id.ivAdminBack).setOnClickListener {
            finish()
        }
        
        findViewById<MaterialCardView>(R.id.btnManageClasses).setOnClickListener {
            startActivity(Intent(this, ManageClassesActivity::class.java))
        }
    }
}
