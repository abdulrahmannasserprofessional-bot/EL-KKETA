package com.example.elkheta

data class ChatMessage(
    val id: String = "",
    val senderName: String = "",
    val senderCode: String = "",
    val text: String = "",
    val fileUrl: String = "",
    val fileType: String = "text", // text, image, audio
    val timestamp: Long = 0,
    val isAdmin: Boolean = false
)
