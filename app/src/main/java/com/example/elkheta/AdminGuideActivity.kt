package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity

class AdminGuideActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_guide)

        findViewById<ImageView>(R.id.btnBackGuide).setOnClickListener { finish() }

        findViewById<Button>(R.id.btnGoToUpload).setOnClickListener {
            startActivity(Intent(this, UploadExamActivity::class.java))
            finish()
        }
    }
}
