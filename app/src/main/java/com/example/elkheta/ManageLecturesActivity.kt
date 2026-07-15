package com.example.elkheta

import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ManageLecturesActivity : AppCompatActivity() {
    private lateinit var adapter: AdminLectureAdapter
    private var subjectName: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_lectures_admin)

        subjectName = intent.getStringExtra("SUBJECT_NAME") ?: ""
        findViewById<TextView>(R.id.tvTitle).text = "إدارة: $subjectName"
        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvLecturesAdmin)
        rv.layoutManager = LinearLayoutManager(this)

        adapter = AdminLectureAdapter(emptyList()) { lecture ->
            LectureRepository.deleteLecture(subjectName, lecture.title)
            Toast.makeText(this, "تم حذف المحاضرة", Toast.LENGTH_SHORT).show()
        }
        rv.adapter = adapter

        LectureRepository.getLectures(subjectName) { list ->
            adapter.updateList(list)
        }

        findViewById<Button>(R.id.btnAddLecture).setOnClickListener {
            // محاكاة إضافة محاضرة (يمكن توسيعها بـ Dialog لاحقاً)
            val newLecture = Lesson(
                title = "محاضرة جديدة ${System.currentTimeMillis().toString().takeLast(4)}",
                duration = "20:00",
                videoUrl = "",
                hasExam = true
            )
            LectureRepository.addLecture(subjectName, newLecture) {
                Toast.makeText(this, "تمت إضافة محاضرة تجريبية", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
