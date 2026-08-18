package com.example.elkheta

import android.content.Context

object PlaybackManager {
    private const val PREFS_NAME = "video_progress"

    fun savePosition(context: Context, videoId: String, position: Long) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(videoId, position).apply()
    }

    fun getPosition(context: Context, videoId: String): Long {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(videoId, 0)
    }
}
