package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class DisplayCodeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_display_code)

        val tvGeneratedCode = findViewById<TextView>(R.id.tvGeneratedCode)
        val btnStartNow = findViewById<Button>(R.id.btnStartNow)

        val code = intent.getStringExtra("STUDENT_CODE")
        val name = intent.getStringExtra("USER_NAME") // استقبال الاسم

        tvGeneratedCode.text = code

        btnStartNow.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            intent.putExtra("USER_NAME", name) // إرسال الاسم للرئيسية
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }
    }
}
