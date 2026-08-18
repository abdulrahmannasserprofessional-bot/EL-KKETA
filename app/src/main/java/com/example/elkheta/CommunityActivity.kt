package com.example.elkheta

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class CommunityActivity : AppCompatActivity() {
    private lateinit var adapter: ChatAdapter
    private var selectedImageUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_community)

        findViewById<ImageView>(R.id.btnBackChat).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvChat)
        val etMsg = findViewById<EditText>(R.id.etMessage)
        val btnSend = findViewById<ImageButton>(R.id.btnSendChat)
        val btnAttach = findViewById<ImageButton>(R.id.btnAttach)

        val studentCode = SessionManager.getStudentCode(this) ?: ""
        val studentName = SessionManager.getStudentName(this) ?: "طالب"

        adapter = ChatAdapter(emptyList(), studentCode)
        rv.layoutManager = LinearLayoutManager(this).apply { stackFromEnd = true }
        rv.adapter = adapter

        ChatRepository.getMessages { messages ->
            adapter.updateList(messages)
            rv.scrollToPosition(messages.size - 1)
        }

        val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            if (uri != null) {
                selectedImageUri = uri
                Toast.makeText(this, "تم اختيار صورة ✅", Toast.LENGTH_SHORT).show()
            }
        }

        btnAttach.setOnClickListener { pickImage.launch("image/*") }

        btnSend.setOnClickListener {
            val text = etMsg.text.toString().trim()
            if (text.isNotEmpty() || selectedImageUri != null) {
                val message = ChatMessage(
                    senderName = studentName,
                    senderCode = studentCode,
                    text = text,
                    isAdmin = false
                )
                
                // تحويل Uri لملف إذا لزم الأمر أو رفعه مباشرة
                ChatRepository.sendMessage(message, null, if (selectedImageUri != null) "image" else "text") { success ->
                    if (success) {
                        etMsg.text.clear()
                        selectedImageUri = null
                    }
                }
            }
        }
    }
}
