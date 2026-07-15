package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object SubjectRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Subjects")

    fun getSubjects(onResult: (List<Subject>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Subject>()
                snapshot.children.forEach { child ->
                    val name = child.child("name").getValue(String::class.java) ?: ""
                    val icon = child.child("iconResId").getValue(Int::class.java) ?: android.R.drawable.ic_menu_agenda
                    list.add(Subject(name, icon))
                }
                onResult(list)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun addSubject(name: String, onComplete: (Boolean) -> Unit) {
        val subject = Subject(name, android.R.drawable.ic_menu_agenda)
        database.push().setValue(subject).addOnCompleteListener { 
            onComplete(it.isSuccessful)
        }
    }
    
    fun deleteSubject(name: String, onComplete: (Boolean) -> Unit) {
        // البحث عن المادة بالاسم لحذفها (في نظام الفايربيز يفضل استخدام IDs)
        database.orderByChild("name").equalTo(name).get().addOnSuccessListener { snapshot ->
            snapshot.children.forEach { it.ref.removeValue() }
            onComplete(true)
        }
    }
}
