package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object LectureRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Subjects")

    fun getLectures(subjectName: String, onResult: (List<Lesson>) -> Unit) {
        database.child(subjectName).child("Lectures")
            .addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Lesson>()
                    snapshot.children.forEach { child ->
                        val lesson = child.getValue(Lesson::class.java)
                        if (lesson != null) list.add(lesson)
                    }
                    onResult(list)
                }
                override fun onCancelled(error: DatabaseError) {
                    onResult(emptyList())
                }
            })
    }

    fun addLecture(subjectName: String, lesson: Lesson, onComplete: (Boolean) -> Unit) {
        database.child(subjectName).child("Lectures").push().setValue(lesson)
            .addOnCompleteListener { onComplete(it.isSuccessful) }
    }

    fun deleteLecture(subjectName: String, lessonTitle: String) {
        database.child(subjectName).child("Lectures")
            .orderByChild("title").equalTo(lessonTitle)
            .get().addOnSuccessListener { snapshot ->
                snapshot.children.forEach { it.ref.removeValue() }
            }
    }
}
