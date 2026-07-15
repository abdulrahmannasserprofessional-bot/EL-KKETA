package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object ExamRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Exams")

    fun addExam(exam: Exam, onComplete: (Boolean) -> Unit) {
        database.push().setValue(exam).addOnCompleteListener { onComplete(it.isSuccessful) }
    }

    fun deleteExam(examTitle: String, onComplete: (Boolean) -> Unit = {}) {
        database.orderByChild("title").equalTo(examTitle).get().addOnSuccessListener { snapshot ->
            snapshot.children.forEach { it.ref.removeValue() }
            onComplete(true)
        }
    }

    fun updateExam(oldTitle: String, newExam: Exam, onComplete: (Boolean) -> Unit = {}) {
        database.orderByChild("title").equalTo(oldTitle).get().addOnSuccessListener { snapshot ->
            snapshot.children.forEach { it.ref.setValue(newExam) }
            onComplete(true)
        }
    }

    fun getExams(onResult: (List<Exam>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Exam>()
                snapshot.children.forEach { child ->
                    child.getValue(Exam::class.java)?.let { list.add(it) }
                }
                onResult(list)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }
}

data class Exam(
    val title: String = "",
    val chapter: String = "",
    val jsonCode: String = ""
)
