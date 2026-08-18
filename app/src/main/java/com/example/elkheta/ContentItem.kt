package com.example.elkheta

data class ContentItem(
    val id: String = "",
    val title: String = "",
    val type: String = "VIDEO", // VIDEO, PDF, EXAM
    val url: String = "",
    val duration: String = "", // Used for Video
    val timestamp: Long = 0
)
