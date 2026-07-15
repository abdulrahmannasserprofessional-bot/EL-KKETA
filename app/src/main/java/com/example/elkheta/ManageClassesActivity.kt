package com.example.elkheta

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ManageClassesActivity : AppCompatActivity() {
    private lateinit var adapter: ClassAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_classes_admin)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        val etName = findViewById<EditText>(R.id.etClassName)
        val btnAdd = findViewById<Button>(R.id.btnAddClass)
        val rv = findViewById<RecyclerView>(R.id.rvClasses)

        rv.layoutManager = LinearLayoutManager(this)
        adapter = ClassAdapter(emptyList()) { classItem ->
            ClassRepository.deleteClass(classItem.id) {
                Toast.makeText(this, "تم حذف الفصل", Toast.LENGTH_SHORT).show()
            }
        }
        rv.adapter = adapter

        ClassRepository.getClasses { list ->
            adapter.updateList(list)
        }

        btnAdd.setOnClickListener {
            val name = etName.text.toString().trim()
            if (name.isNotEmpty()) {
                ClassRepository.addClass(name) { success ->
                    if (success) {
                        etName.text.clear()
                        Toast.makeText(this, "تمت إضافة الفصل بنجاح", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
}
