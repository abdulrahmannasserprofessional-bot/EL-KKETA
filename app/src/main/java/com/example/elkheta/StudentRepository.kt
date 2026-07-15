package com.example.elkheta

import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener

object StudentRepository {
    private val database by lazy { FirebaseDatabase.getInstance().getReference("Students") }

    fun registerStudent(user: User, onComplete: (Boolean) -> Unit) {
        database.child(user.studentCode).setValue(user)
            .addOnCompleteListener { onComplete(it.isSuccessful) }
    }

    fun checkLogin(code: String, onResult: (User?) -> Unit) {
        val upperCode = code.uppercase()
        database.child(upperCode).get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                val user = snapshot.getValue(User::class.java)
                onResult(user)
            } else {
                // محاولة التحقق من أنه كود تفعيل (KH)
                CodeRepository.validateCode(upperCode) { isValid ->
                    if (isValid) {
                        // السماح بالدخول كمستخدم مجهول مؤقتاً أو إنشاء حساب تلقائي
                        onResult(User("طالب جديد", upperCode, "01000000000"))
                    } else {
                        onResult(null)
                    }
                }
            }
        }.addOnFailureListener {
            onResult(null)
        }
    }

    fun getAllStudents(onResult: (List<User>) -> Unit) {
        database.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<User>()
                snapshot.children.forEach { child ->
                    child.getValue(User::class.java)?.let { list.add(it) }
                }
                onResult(list)
            }
            override fun onCancelled(error: DatabaseError) {
                onResult(emptyList())
            }
        })
    }

    fun deleteStudent(code: String, onComplete: (Boolean) -> Unit) {
        database.child(code.uppercase()).removeValue()
            .addOnCompleteListener { onComplete(it.isSuccessful) }
    }

    fun addPoints(code: String, points: Int) {
        val studentRef = database.child(code.uppercase()).child("points")
        studentRef.get().addOnSuccessListener { snapshot ->
            val currentPoints = snapshot.getValue(Int::class.java) ?: 0
            studentRef.setValue(currentPoints + points)
        }
    }

    fun updateDeviceInfo(code: String, model: String, ip: String, connection: String, location: String) {
        val updates = mapOf(
            "deviceModel" to model,
            "ipAddress" to ip,
            "connectionType" to connection,
            "location" to location
        )
        database.child(code.uppercase()).updateChildren(updates)
    }

    fun getTopStudents(limit: Int, onResult: (List<User>) -> Unit) {
        database.orderByChild("points").limitToLast(limit).get().addOnSuccessListener { snapshot ->
            val list = mutableListOf<User>()
            snapshot.children.forEach { child ->
                child.getValue(User::class.java)?.let { list.add(it) }
            }
            onResult(list.reversed()) // ليكون الترتيب من الأعلى للأقل
        }
    }
}
