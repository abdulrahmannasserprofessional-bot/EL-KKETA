package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object ContentRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Content")

    fun getContent(subjectName: String, onResult: (List<ContentItem>) -> Unit) {
        database.child(subjectName).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<ContentItem>()
                snapshot.children.forEach { child ->
                    child.getValue(ContentItem::class.java)?.let { list.add(it) }
                }
                onResult(list.sortedBy { it.timestamp })
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun addContent(subjectName: String, item: ContentItem, onComplete: (Boolean) -> Unit) {
        val id = database.child(subjectName).push().key ?: return
        val newItem = item.copy(id = id, timestamp = System.currentTimeMillis())
        database.child(subjectName).child(id).setValue(newItem).addOnCompleteListener {
            onComplete(it.isSuccessful)
        }
    }

    fun deleteContent(subjectName: String, contentId: String, onComplete: (Boolean) -> Unit) {
        database.child(subjectName).child(contentId).removeValue().addOnCompleteListener {
            onComplete(it.isSuccessful)
        }
    }
}
