package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class AdminGateActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_gate)

        val etPass = findViewById<EditText>(R.id.etAdminPass)
        val btnVerify = findViewById<Button>(R.id.btnVerifyAdmin)

        btnVerify.setOnClickListener {
            val enteredPin = etPass.text.toString()
            if (enteredPin.isEmpty()) {
                Toast.makeText(this, "يرجى إدخال الرمز", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // التحقق من الرمز في Firebase بشكل آمن
            FirebaseDatabase.getInstance().getReference("Settings/adminPin")
                .get().addOnSuccessListener { snapshot ->
                    // جلب القيمة كـ Any لتجنب أخطاء النوع (إذا كانت رقم أو نص في Firebase)
                    val rawPin = snapshot.value
                    val correctPin = rawPin?.toString() ?: "1234"
                    
                    if (enteredPin == correctPin) {
                        startActivity(Intent(this, AdminActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this, "الرمز غير صحيح! ❌", Toast.LENGTH_SHORT).show()
                        etPass.text.clear()
                    }
                }.addOnFailureListener {
                    Toast.makeText(this, "خطأ في الاتصال بالخادم", Toast.LENGTH_SHORT).show()
                }
        }
    }
}
