package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object ClassRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Classes")

    fun getClasses(onResult: (List<ClassRoom>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<ClassRoom>()
                snapshot.children.forEach { child ->
                    val name = child.child("name").getValue(String::class.java) ?: ""
                    list.add(ClassRoom(child.key ?: "", name, 0))
                }
                onResult(list)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun addClass(name: String, onComplete: (Boolean) -> Unit) {
        val id = database.push().key ?: ""
        database.child(id).setValue(ClassRoom(id, name))
            .addOnCompleteListener { onComplete(it.isSuccessful) }
    }

    fun deleteClass(id: String, onComplete: (Boolean) -> Unit) {
        database.child(id).removeValue()
            .addOnCompleteListener { onComplete(it.isSuccessful) }
    }
}
