package com.example.elkheta

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class AdminNotificationsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_notifications)

        val etMessage = findViewById<EditText>(R.id.etNotificationMessage)
        val btnSend = findViewById<Button>(R.id.btnSendNotification)
        val ivBack = findViewById<ImageView>(R.id.ivBackAdminNotif)

        ivBack.setOnClickListener { finish() }

        btnSend.setOnClickListener {
            val message = etMessage.text.toString().trim()
            if (message.isNotEmpty()) {
                sendNotification(message)
            } else {
                Toast.makeText(this, "يرجى كتابة التنبيه أولاً", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendNotification(message: String) {
        val ref = FirebaseDatabase.getInstance().getReference("Notifications")
        val notificationId = ref.push().key ?: return
        
        val notificationData = mapOf(
            "id" to notificationId,
            "message" to message,
            "timestamp" to System.currentTimeMillis()
        )

        ref.child(notificationId).setValue(notificationData)
            .addOnSuccessListener {
                Toast.makeText(this, "تم إرسال التنبيه بنجاح ✅", Toast.LENGTH_SHORT).show()
                findViewById<EditText>(R.id.etNotificationMessage).text.clear()
            }
            .addOnFailureListener {
                Toast.makeText(this, "فشل إرسال التنبيه ❌", Toast.LENGTH_SHORT).show()
            }
    }
}
