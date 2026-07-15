package com.example.elkheta

data class Lesson(
    val title: String,
    val duration: String,
    val videoUrl: String,
    val pdfUrl: String = "",
    val hasExam: Boolean = false
)
