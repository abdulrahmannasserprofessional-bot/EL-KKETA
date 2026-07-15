package com.example.elkheta

import android.content.Context

object SessionManager {
    private const val PREF_NAME = "ELKHETA_SESSION"
    private const val KEY_CODE = "STUDENT_CODE"
    private const val KEY_NAME = "STUDENT_NAME"
    private const val KEY_REMEMBER = "REMEMBER_ME"

    fun startSession(context: Context, code: String, name: String, remember: Boolean) {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_CODE, code)
            .putString(KEY_NAME, name)
            .putBoolean(KEY_REMEMBER, remember)
            .apply()
    }

    fun isRemembered(context: Context): Boolean {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE).getBoolean(KEY_REMEMBER, false)
    }

    fun getStudentCode(context: Context): String? {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE).getString(KEY_CODE, null)
    }

    fun getStudentName(context: Context): String? {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE).getString(KEY_NAME, null)
    }

    fun clear(context: Context) {
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE).edit().clear().apply()
    }
}
