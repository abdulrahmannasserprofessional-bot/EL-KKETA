package com.example.elkheta

data class Course(
    val id: Int,
    val title: String,
    val teacherName: String,
    val price: String,
    val imageUrl: String = "" // سنستخدم صور افتراضية حالياً
)
