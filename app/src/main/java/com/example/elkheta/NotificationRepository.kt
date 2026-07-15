package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object NotificationRepository {
    private val database = FirebaseDatabase.getInstance().getReference("Settings").child("LatestNotification")

    fun getLatestNotification(onResult: (String) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val message = snapshot.getValue(String::class.java) ?: "لا توجد تنبيهات حالياً"
                onResult(message)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult("لا توجد تنبيهات حالياً")
            }
        })
    }

    fun addNotification(message: String, onComplete: (Boolean) -> Unit) {
        database.setValue(message).addOnCompleteListener { 
            onComplete(it.isSuccessful)
        }
    }
}
