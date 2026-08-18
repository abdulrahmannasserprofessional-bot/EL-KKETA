package com.example.elkheta

data class TutorialItem(
    val title: String,
    val description: String,
    val videoUrl: String = "",
    val iconRes: Int
)
