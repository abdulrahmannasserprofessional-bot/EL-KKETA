package com.example.elkheta

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ManageSubjectsActivity : AppCompatActivity() {
    private lateinit var adapter: SubjectAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_subjects_admin)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        val etName = findViewById<EditText>(R.id.etSubjectName)
        val btnAdd = findViewById<Button>(R.id.btnAddSubject)
        val rv = findViewById<RecyclerView>(R.id.rvSubjectsAdmin)

        adapter = SubjectAdapter(
            subjects = emptyList(),
            isAdmin = true,
            onDeleteClick = { subject ->
                SubjectRepository.deleteSubject(subject.name) { success ->
                    if (success) {
                        Toast.makeText(this, "تم حذف المادة", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        rv.layoutManager = LinearLayoutManager(this)
        rv.adapter = adapter

        // Fetch subjects
        SubjectRepository.getSubjects { list ->
            adapter.updateList(list)
        }

        btnAdd.setOnClickListener {
            val name = etName.text.toString().trim()
            if (name.isNotEmpty()) {
                SubjectRepository.addSubject(name) { success ->
                    if (success) {
                        etName.text.clear()
                        Toast.makeText(this, "تمت إضافة المادة", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "فشل إضافة المادة", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
}
