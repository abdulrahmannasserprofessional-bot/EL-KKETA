package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class CodeActivationActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_code_activation)

        val activationCode = intent.getStringExtra("ACTIVATION_CODE") ?: ""
        findViewById<TextView>(R.id.tvCodeLabel).text = "الكود المستخدم: $activationCode"

        val etName = findViewById<EditText>(R.id.etStudentName)
        val etPhone = findViewById<EditText>(R.id.etStudentPhone)
        val btnActivate = findViewById<Button>(R.id.btnActivate)

        btnActivate.setOnClickListener {
            val name = etName.text.toString().trim()
            val phone = etPhone.text.toString().trim()

            if (name.isEmpty() || phone.isEmpty()) {
                Toast.makeText(this, "يرجى إكمال البيانات", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // 1. تسجيل الطالب كحساب جديد
            val user = User(name, activationCode, phone)
            StudentRepository.registerStudent(user) { success ->
                if (success) {
                    // حفظ الجلسة (تلقائياً تذكرني عند أول تفعيل)
                    SessionManager.startSession(this, activationCode, name, true)

                    // 2. وسم الكود كـ "مستخدم" مع ربطه ببيانات الطالب
                    updateCodeStatus(activationCode, name, phone)

                    Toast.makeText(this, "تم التفعيل بنجاح! ❤️", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, MainActivity::class.java)
                    intent.putExtra("USER_NAME", name)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this, "فشل في عملية التسجيل", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun updateCodeStatus(code: String, studentName: String, studentPhone: String) {
        val database = FirebaseDatabase.getInstance().getReference("ActivationCodes")
        val updates = mapOf(
            "isUsed" to true,
            "usedBy" to studentName,
            "phone" to studentPhone,
            "activatedAt" to System.currentTimeMillis()
        )
        database.child(code.uppercase()).updateChildren(updates)
    }
}
