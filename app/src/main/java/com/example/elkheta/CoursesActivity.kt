package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView

class CoursesActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_courses)

        val btnBack = findViewById<ImageView>(R.id.btnBack)
        btnBack.setOnClickListener { finish() }

        val rvSubjects = findViewById<RecyclerView>(R.id.rvSubjects)
        rvSubjects.layoutManager = GridLayoutManager(this, 2)

        SubjectRepository.getSubjects { subjects ->
            rvSubjects.adapter = SubjectAdapter(subjects, isAdmin = false)
        }
    }
}
