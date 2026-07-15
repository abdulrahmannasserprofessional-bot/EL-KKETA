package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class LessonsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lessons)

        val subjectName = intent.getStringExtra("SUBJECT_NAME") ?: "المادة"
        findViewById<TextView>(R.id.tvSubjectTitle).text = subjectName
        findViewById<ImageView>(R.id.btnBackLessons).setOnClickListener { finish() }

        val rvLessons = findViewById<RecyclerView>(R.id.rvLessons)
        rvLessons.layoutManager = LinearLayoutManager(this)

        LectureRepository.getLectures(subjectName) { lectures ->
            rvLessons.adapter = LessonAdapter(lectures)
        }
    }
}
