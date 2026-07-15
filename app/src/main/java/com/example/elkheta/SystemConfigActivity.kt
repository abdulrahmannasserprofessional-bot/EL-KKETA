package com.example.elkheta

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class SystemConfigActivity : androidx.appcompat.app.AppCompatActivity() {
    private val database = FirebaseDatabase.getInstance().getReference("Settings")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_system_config_admin)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        val etVersion = findViewById<EditText>(R.id.etMinVersion)
        val etUrl = findViewById<EditText>(R.id.etUpdateUrl)
        val etAdminPin = findViewById<EditText>(R.id.etAdminPin)
        val btnSave = findViewById<Button>(R.id.btnSaveConfig)

        // جلب الإعدادات الحالية بشكل آمن
        database.get().addOnSuccessListener { snapshot ->
            val minVersion = snapshot.child("minVersion").value
            val updateUrl = snapshot.child("updateUrl").value
            val adminPin = snapshot.child("adminPin").value

            etVersion.setText(minVersion?.toString() ?: "1")
            etUrl.setText(updateUrl?.toString() ?: "")
            etAdminPin.setText(adminPin?.toString() ?: "1234")
        }

        btnSave.setOnClickListener {
            val version = etVersion.text.toString().toIntOrNull() ?: 1
            val url = etUrl.text.toString()
            val pin = etAdminPin.text.toString()

            val updates = mapOf(
                "minVersion" to version,
                "updateUrl" to url,
                "adminPin" to pin
            )

            database.updateChildren(updates).addOnCompleteListener {
                if (it.isSuccessful) {
                    Toast.makeText(this, "تم حفظ إعدادات النظام", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
