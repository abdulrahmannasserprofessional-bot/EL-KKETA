package com.example.elkheta

data class Question(
    val id: String = "",
    val text: String = "",
    val options: List<String> = emptyList(),
    val correctAnswerIndex: Int = -1,
    val explanation: String = "" // يحتوي على الكلمات المفتاحية المميزة بـ **كلمة**
)

data class StudentMistake(
    val subjectName: String = "",
    val questionText: String = "",
    val userAnswer: String = "",
    val correctAnswer: String = "",
    val explanation: String = "",
    val timestamp: Long = System.currentTimeMillis()
)
