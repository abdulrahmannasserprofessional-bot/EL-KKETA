package com.example.elkheta

data class Inquiry(
    val id: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val message: String = "",
    val voiceUrl: String = "",
    val imageUrl: String = "",
    val timestamp: Long = 0,
    val isReplied: Boolean = false,
    val adminReply: String = "",
    val adminReplyVoiceUrl: String = ""
)
