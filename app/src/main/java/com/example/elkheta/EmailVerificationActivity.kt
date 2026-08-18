package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth

class EmailVerificationActivity : AppCompatActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_verify_email)

        auth = FirebaseAuth.getInstance()

        val btnCheckVerified = findViewById<Button>(R.id.btnCheckVerified)
        val tvResendEmail = findViewById<TextView>(R.id.tvResendEmail)

        btnCheckVerified.setOnClickListener {
            // تحديث حالة المستخدم من السيرفر للتأكد هل ضغط على الرابط أم لا
            auth.currentUser?.reload()?.addOnCompleteListener {
                if (auth.currentUser?.isEmailVerified == true) {
                    val intent = Intent(this, MainActivity::class.java)
                    intent.putExtra("USER_NAME", auth.currentUser?.displayName)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this, "يرجى تفعيل الحساب من بريدك الإلكتروني أولاً", Toast.LENGTH_SHORT).show()
                }
            }
        }

        tvResendEmail.setOnClickListener {
            auth.currentUser?.sendEmailVerification()?.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Toast.makeText(this, "تم إعادة إرسال الرابط بنجاح", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "فشل الإرسال: ${task.exception?.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
