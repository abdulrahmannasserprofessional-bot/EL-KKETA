package com.example.elkheta

data class User(
    val fullName: String = "",
    val whatsapp: String = "",
    val studentCode: String = "",
    val points: Int = 0,
    val deviceModel: String = "",
    val ipAddress: String = "",
    val connectionType: String = "",
    val location: String = ""
)
