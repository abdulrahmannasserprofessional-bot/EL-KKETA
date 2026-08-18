package com.example.elkheta

import android.app.AlertDialog
import android.content.Intent
import android.media.MediaRecorder
import android.net.Uri
import android.os.Bundle
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.io.File

class SupportActivity : AppCompatActivity() {
    private lateinit var adapter: InquiryAdapter
    private var voiceFile: File? = null
    private var imageUri: Uri? = null
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_support)

        findViewById<ImageView>(R.id.btnBackSupport).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvSupport)
        rv.layoutManager = LinearLayoutManager(this)
        
        val studentId = SessionManager.getStudentCode(this) ?: ""
        
        adapter = InquiryAdapter(emptyList()) { inquiry ->
            showInquiryDetails(inquiry)
        }
        rv.adapter = adapter

        SupportRepository.getStudentInquiries(studentId) { list ->
            adapter.updateList(list)
        }

        findViewById<Button>(R.id.btnNewInquiry).setOnClickListener {
            showAddInquiryDialog(studentId)
        }
    }

    private fun showAddInquiryDialog(studentId: String) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_inquiry, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()

        val etMessage = dialogView.findViewById<EditText>(R.id.etInquiryMessage)
        val btnImage = dialogView.findViewById<ImageButton>(R.id.btnAttachImage)
        val btnVoice = dialogView.findViewById<ImageButton>(R.id.btnRecordVoice)
        val tvStatus = dialogView.findViewById<TextView>(R.id.tvStatus)
        val btnSend = dialogView.findViewById<Button>(R.id.btnSend)

        val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            imageUri = uri
            tvStatus.text = "تم اختيار صورة ✅"
        }

        btnImage.setOnClickListener { pickImage.launch("image/*") }

        btnVoice.setOnClickListener {
            if (!isRecording) {
                startRecording()
                btnVoice.setImageResource(android.R.drawable.ic_media_pause)
                tvStatus.text = "جاري التسجيل..."
                isRecording = true
            } else {
                stopRecording()
                btnVoice.setImageResource(android.R.drawable.ic_btn_speak_now)
                tvStatus.text = "تم تسجيل الصوت ✅"
                isRecording = false
            }
        }

        btnSend.setOnClickListener {
            val message = etMessage.text.toString().trim()
            if (message.isNotEmpty() || voiceFile != null || imageUri != null) {
                val studentName = SessionManager.getStudentName(this) ?: "طالب"
                val inquiry = Inquiry(studentId = studentId, studentName = studentName, message = message)
                
                btnSend.isEnabled = false
                btnSend.text = "جاري الإرسال..."
                
                SupportRepository.sendInquiry(inquiry, voiceFile, imageUri) { success ->
                    if (success) {
                        Toast.makeText(this, "تم إرسال استفسارك بنجاح", Toast.LENGTH_SHORT).show()
                        dialog.dismiss()
                        voiceFile = null
                        imageUri = null
                    } else {
                        btnSend.isEnabled = true
                        btnSend.text = "إرسال الآن"
                        Toast.makeText(this, "فشل الإرسال، حاول مرة أخرى", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
        dialog.show()
    }

    private fun startRecording() {
        voiceFile = File(externalCacheDir, "recording.3gp")
        mediaRecorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
            setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
            setOutputFile(voiceFile?.absolutePath)
            prepare()
            start()
        }
    }

    private fun stopRecording() {
        mediaRecorder?.apply {
            stop()
            release()
        }
        mediaRecorder = null
    }

    private fun showInquiryDetails(inquiry: Inquiry) {
        val message = if (inquiry.isReplied) "الرد: ${inquiry.adminReply}" else "قيد الانتظار لم يتم الرد بعد"
        AlertDialog.Builder(this)
            .setTitle("تفاصيل الاستفسار")
            .setMessage("رسالتك: ${inquiry.message}\n\n$message")
            .setPositiveButton("حسناً", null)
            .show()
    }
}
