package com.example.elkheta

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

class AddPostActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_post)

        val etTitle = findViewById<EditText>(R.id.etPostTitle)
        val etDesc = findViewById<EditText>(R.id.etPostDesc)
        val etUrl = findViewById<EditText>(R.id.etPostUrl)
        val spinner = findViewById<Spinner>(R.id.spinnerType)
        val btnSave = findViewById<Button>(R.id.btnSavePost)

        val types = arrayOf("TEXT", "VIDEO", "PDF")
        spinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, types)

        btnSave.setOnClickListener {
            val title = etTitle.text.toString().trim()
            val desc = etDesc.text.toString().trim()
            val url = etUrl.text.toString().trim()
            val type = spinner.selectedItem.toString()

            if (title.isNotEmpty()) {
                val post = Post(title = title, description = desc, url = url, type = type)
                PostRepository.addPost(post) { success ->
                    if (success) {
                        Toast.makeText(this, "تم النشر بنجاح", Toast.LENGTH_SHORT).show()
                        finish()
                    }
                }
            } else {
                Toast.makeText(this, "يرجى كتابة العنوان", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
