package com.example.elkheta

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ManageStudentsActivity : AppCompatActivity() {
    private lateinit var adapter: StudentAdapter
    private var allStudentsList: List<User> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_students)

        val etSearch = findViewById<EditText>(R.id.etSearchStudent)
        val rv = findViewById<RecyclerView>(R.id.rvStudentsList)
        val btnBack = findViewById<ImageView>(R.id.btnBack)

        btnBack.setOnClickListener { finish() }

        adapter = StudentAdapter(emptyList()) { student ->
            StudentRepository.deleteStudent(student.studentCode) { success ->
                if (success) {
                    Toast.makeText(this, "تم حذف الطالب: ${student.fullName}", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "فشل حذف الطالب", Toast.LENGTH_SHORT).show()
                }
            }
        }

        rv.layoutManager = LinearLayoutManager(this)
        rv.adapter = adapter

        // Fetch students from Firebase
        StudentRepository.getAllStudents { list ->
            allStudentsList = list
            refreshList(etSearch.text.toString())
        }

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                refreshList(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun refreshList(query: String) {
        val filtered = if (query.isEmpty()) {
            allStudentsList
        } else {
            allStudentsList.filter {
                it.fullName.contains(query, true) || it.studentCode.contains(query, true) 
            }
        }
        adapter.updateList(filtered)
    }
}
