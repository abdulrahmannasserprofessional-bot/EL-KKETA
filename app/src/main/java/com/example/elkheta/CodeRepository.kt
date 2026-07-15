package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase

object CodeRepository {
    private val database = FirebaseDatabase.getInstance().getReference("ActivationCodes")

    fun saveCodes(codes: List<String>, onComplete: (Boolean) -> Unit) {
        val updates = mutableMapOf<String, Any>()
        codes.forEach { code ->
            updates[code] = mapOf(
                "isUsed" to false,
                "createdAt" to System.currentTimeMillis()
            )
        }
        database.updateChildren(updates).addOnCompleteListener { 
            onComplete(it.isSuccessful)
        }
    }

    fun validateCode(code: String, onResult: (Boolean) -> Unit) {
        database.child(code.uppercase()).get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                val isUsed = snapshot.child("isUsed").getValue(Boolean::class.java) ?: false
                onResult(!isUsed) // الكود صالح إذا لم يتم استخدامه
            } else {
                onResult(false)
            }
        }.addOnFailureListener {
            onResult(false)
        }
    }

    fun markCodeAsUsed(code: String) {
        database.child(code.uppercase()).child("isUsed").setValue(true)
    }
}
