package com.example.elkheta

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

object MistakeRepository {
    private const val PREFS_NAME = "elkheta_mistakes"
    private const val KEY_MISTAKES = "mistakes_list"

    fun saveMistake(context: Context, mistake: StudentMistake) {
        val mistakes = getAllMistakes(context).toMutableList()
        mistakes.add(mistake)
        
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = Gson().toJson(mistakes)
        prefs.edit().putString(KEY_MISTAKES, json).apply()
    }

    fun getAllMistakes(context: Context): List<StudentMistake> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_MISTAKES, null) ?: return emptyList()
        val type = object : com.google.gson.reflect.TypeToken<List<StudentMistake>>() {}.type
        return Gson().fromJson(json, type)
    }
}
