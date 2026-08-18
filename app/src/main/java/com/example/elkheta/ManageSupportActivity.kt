package com.example.elkheta

import android.app.AlertDialog
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ManageSupportActivity : AppCompatActivity() {
    private lateinit var adapter: InquiryAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_support)

        findViewById<ImageView>(R.id.btnBackAdminSupport).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvAdminSupport)
        rv.layoutManager = LinearLayoutManager(this)

        adapter = InquiryAdapter(emptyList()) { inquiry ->
            showReplyDialog(inquiry)
        }
        rv.adapter = adapter

        SupportRepository.getAllInquiries { list ->
            adapter.updateList(list)
        }
    }

    private fun showReplyDialog(inquiry: Inquiry) {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 40, 50, 10)
        }
        
        val tvMsg = TextView(this).apply {
            text = "من: ${inquiry.studentName}\nالرسالة: ${inquiry.message}"
            textSize = 16sp
            setTextColor(android.graphics.Color.BLACK)
        }
        layout.addView(tvMsg)

        val etReply = EditText(this).apply {
            hint = "اكتب الرد هنا..."
        }
        layout.addView(etReply)

        AlertDialog.Builder(this)
            .setTitle("الرد على الاستفسار")
            .setView(layout)
            .setPositiveButton("إرسال الرد") { _, _ ->
                val reply = etReply.text.toString().trim()
                if (reply.isNotEmpty()) {
                    SupportRepository.replyToInquiry(inquiry.id, reply) { success ->
                        if (success) Toast.makeText(this, "تم إرسال الرد", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }
    
    // Helper to convert sp to px for text size
    private val Int.sp: Float get() = this * resources.displayMetrics.scaledDensity
}
