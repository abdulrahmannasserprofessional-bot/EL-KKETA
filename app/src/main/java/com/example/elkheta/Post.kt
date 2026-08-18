package com.example.elkheta

data class Post(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val type: String = "TEXT", // TEXT, VIDEO, PDF
    val url: String = "",
    val timestamp: Long = 0
)
