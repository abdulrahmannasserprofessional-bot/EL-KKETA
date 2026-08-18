package com.example.elkheta

import android.net.Uri
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import com.google.firebase.storage.FirebaseStorage
import java.io.File

object SupportRepository {
    private val database = FirebaseDatabase.getInstance().getReference("SupportInquiries")
    private val storage = FirebaseStorage.getInstance().getReference("SupportFiles")

    fun sendInquiry(inquiry: Inquiry, voiceFile: File?, imageUri: Uri?, onComplete: (Boolean) -> Unit) {
        val id = database.push().key ?: return
        var finalInquiry = inquiry.copy(id = id, timestamp = System.currentTimeMillis())

        if (voiceFile != null) {
            val voiceRef = storage.child("voices/$id.3gp")
            voiceRef.putFile(Uri.fromFile(voiceFile)).addOnSuccessListener {
                voiceRef.downloadUrl.addOnSuccessListener { url ->
                    finalInquiry = finalInquiry.copy(voiceUrl = url.toString())
                    uploadFinalInquiry(finalInquiry, imageUri, onComplete)
                }
            }.addOnFailureListener { onComplete(false) }
        } else {
            uploadFinalInquiry(finalInquiry, imageUri, onComplete)
        }
    }

    private fun uploadFinalInquiry(inquiry: Inquiry, imageUri: Uri?, onComplete: (Boolean) -> Unit) {
        if (imageUri != null) {
            val imageRef = storage.child("images/${inquiry.id}.jpg")
            imageRef.putFile(imageUri).addOnSuccessListener {
                imageRef.downloadUrl.addOnSuccessListener { url ->
                    val updatedInquiry = inquiry.copy(imageUrl = url.toString())
                    database.child(updatedInquiry.id).setValue(updatedInquiry).addOnCompleteListener {
                        onComplete(it.isSuccessful)
                    }
                }
            }.addOnFailureListener { onComplete(false) }
        } else {
            database.child(inquiry.id).setValue(inquiry).addOnCompleteListener {
                onComplete(it.isSuccessful)
            }
        }
    }

    fun getStudentInquiries(studentId: String, onResult: (List<Inquiry>) -> Unit) {
        database.orderByChild("studentId").equalTo(studentId)
            .addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Inquiry>()
                    snapshot.children.forEach { child ->
                        child.getValue(Inquiry::class.java)?.let { list.add(it) }
                    }
                    onResult(list.reversed())
                }
                override fun onCancelled(error: DatabaseError) {
                    onResult(emptyList())
                }
            })
    }

    fun getAllInquiries(onResult: (List<Inquiry>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<Inquiry>()
                snapshot.children.forEach { child ->
                    child.getValue(Inquiry::class.java)?.let { list.add(it) }
                }
                onResult(list.reversed())
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun replyToInquiry(id: String, reply: String, onComplete: (Boolean) -> Unit) {
        database.child(id).child("adminReply").setValue(reply)
        database.child(id).child("isReplied").setValue(true).addOnCompleteListener {
            onComplete(it.isSuccessful)
        }
    }
}
