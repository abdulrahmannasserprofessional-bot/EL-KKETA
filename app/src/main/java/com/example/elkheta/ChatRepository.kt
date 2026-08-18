package com.example.elkheta

import android.net.Uri
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import com.google.firebase.storage.FirebaseStorage
import java.io.File

object ChatRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Chats/Global")
    private val storage = FirebaseStorage.getInstance().getReference("ChatFiles")

    fun getMessages(onResult: (List<ChatMessage>) -> Unit) {
        database.limitToLast(100).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<ChatMessage>()
                snapshot.children.forEach { child ->
                    child.getValue(ChatMessage::class.java)?.let { list.add(it) }
                }
                onResult(list)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun sendMessage(message: ChatMessage, file: File?, fileType: String, onComplete: (Boolean) -> Unit) {
        val id = database.push().key ?: return
        var finalMsg = message.copy(id = id, timestamp = System.currentTimeMillis())

        if (file != null) {
            val extension = if (fileType == "audio") "3gp" else "jpg"
            val fileRef = storage.child("$id.$extension")
            fileRef.putFile(Uri.fromFile(file)).addOnSuccessListener {
                fileRef.downloadUrl.addOnSuccessListener { url ->
                    finalMsg = finalMsg.copy(fileUrl = url.toString(), fileType = fileType)
                    database.child(id).setValue(finalMsg).addOnCompleteListener { onComplete(it.isSuccessful) }
                }
            }.addOnFailureListener { onComplete(false) }
        } else {
            database.child(id).setValue(finalMsg).addOnCompleteListener { onComplete(it.isSuccessful) }
        }
    }
}
