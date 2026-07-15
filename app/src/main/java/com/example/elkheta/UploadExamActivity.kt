package com.example.elkheta

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class UploadExamActivity : androidx.appcompat.app.AppCompatActivity() {
    private lateinit var adapter: ContentAdapter
    private var editingExamTitle: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload_exam)

        val etChapter = findViewById<EditText>(R.id.etChapter)
        val etTitle = findViewById<EditText>(R.id.etTitle)
        val etExamJsonCode = findViewById<EditText>(R.id.etExamJsonCode)
        val etLink = findViewById<EditText>(R.id.etLink)
        val rgType = findViewById<RadioGroup>(R.id.rgType)
        val btnPublish = findViewById<Button>(R.id.btnPublish)
        val btnBack = findViewById<ImageButton>(R.id.btnBack)
        val rvContent = findViewById<RecyclerView>(R.id.rvContent)

        btnBack.setOnClickListener { finish() }

        // RecyclerView setup
        adapter = ContentAdapter(
            contents = emptyList(),
            onEdit = { exam ->
                etTitle.setText(exam.title)
                etChapter.setText(exam.chapter)
                etExamJsonCode.setText(exam.jsonCode)
                rgType.check(R.id.rbExam)
                editingExamTitle = exam.title
                btnPublish.text = "تحديث المحتوى الآن"
            },
            onDelete = { exam ->
                ExamRepository.deleteExam(exam.title) { success ->
                    if (success) {
                        Toast.makeText(this, "تم حذف المحتوى", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        rvContent.layoutManager = LinearLayoutManager(this)
        rvContent.adapter = adapter

        // Fetch exams
        ExamRepository.getExams { list ->
            adapter.updateList(list)
        }

        // Toggle JSON code field visibility
        rgType.setOnCheckedChangeListener { _, checkedId ->
            if (checkedId == R.id.rbExam) {
                etExamJsonCode.visibility = View.VISIBLE
                etLink.visibility = View.GONE
            } else {
                etExamJsonCode.visibility = View.GONE
                etLink.visibility = View.VISIBLE
            }
        }

        btnPublish.setOnClickListener {
            val title = etTitle.text.toString().trim()
            val chapter = etChapter.text.toString().trim()
            val isExam = rgType.checkedRadioButtonId == R.id.rbExam

            if (title.isNotEmpty()) {
                val code = if (isExam) etExamJsonCode.text.toString().trim() else "N/A"
                val newExam = Exam(title, chapter, code)

                if (editingExamTitle == null) {
                    ExamRepository.addExam(newExam) { success ->
                        if (success) {
                            Toast.makeText(this, "تم الرفع بنجاح 🚀", Toast.LENGTH_SHORT).show()
                            clearFields(etTitle, etChapter, etExamJsonCode)
                        }
                    }
                } else {
                    ExamRepository.updateExam(editingExamTitle!!, newExam) { success ->
                        if (success) {
                            Toast.makeText(this, "تم التحديث بنجاح ✅", Toast.LENGTH_SHORT).show()
                            editingExamTitle = null
                            btnPublish.text = "نشر المحتوى فوراً"
                            clearFields(etTitle, etChapter, etExamJsonCode)
                        }
                    }
                }
            } else {
                Toast.makeText(this, "يرجى إكمال البيانات", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun clearFields(vararg editTexts: EditText) {
        editTexts.forEach { it.text.clear() }
    }
}
