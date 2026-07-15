package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class RegisterActivity : androidx.appcompat.app.AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etFullName = findViewById<EditText>(R.id.etFullName)
        val etWhatsApp = findViewById<EditText>(R.id.etWhatsApp)
        val btnGenerateCode = findViewById<Button>(R.id.btnGenerateCode)
        val tvGoToLogin = findViewById<TextView>(R.id.tvGoToLogin)

        btnGenerateCode.setOnClickListener {
            val name = etFullName.text.toString().trim()
            val phone = etWhatsApp.text.toString().trim()

            if (name.isNotEmpty() && phone.length >= 10) {
                val studentCode = generateStudentCode(name, phone)
                
                val newUser = User(name, phone, studentCode)
                
                StudentRepository.registerStudent(newUser) { success ->
                    if (success) {
                        // الانتقال لصفحة الكود
                        val intent = Intent(this, DisplayCodeActivity::class.java)
                        intent.putExtra("STUDENT_CODE", studentCode)
                        intent.putExtra("USER_NAME", name)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this, "فشل تسجيل الطالب، حاول لاحقاً", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                Toast.makeText(this, "يرجى إدخال البيانات بشكل صحيح", Toast.LENGTH_SHORT).show()
            }
        }

        tvGoToLogin.setOnClickListener {
            finish()
        }
    }

    private fun generateStudentCode(name: String, phone: String): String {
        val firstChar = if (name.isNotEmpty()) name.first().toString() else "X"
        val englishChar = mapArabicToEnglish(firstChar)
        // أخذ آخر 4 أرقام من الهاتف
        val lastFour = if (phone.length >= 4) phone.takeLast(4) else phone.padStart(4, '0')
        return (englishChar + lastFour).uppercase()
    }

    private fun mapArabicToEnglish(char: String): String {
        val mapping = mapOf(
            "أ" to "A", "ا" to "A", "ب" to "B", "ت" to "T", "ث" to "T",
            "ج" to "J", "ح" to "H", "خ" to "K", "د" to "D", "ذ" to "D",
            "ر" to "R", "ز" to "Z", "س" to "S", "ش" to "S", "ص" to "S",
            "ض" to "D", "ط" to "T", "ظ" to "Z", "ع" to "A", "غ" to "G",
            "ف" to "F", "ق" to "Q", "ك" to "K", "ل" to "L", "م" to "M",
            "ن" to "N", "ه" to "H", "و" to "W", "ي" to "Y"
        )
        return mapping[char] ?: char.take(1)
    }
}
