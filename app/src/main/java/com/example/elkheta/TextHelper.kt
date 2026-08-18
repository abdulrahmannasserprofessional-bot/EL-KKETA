package com.example.elkheta

import android.text.Html
import android.text.Spanned
import androidx.core.text.HtmlCompat

object TextHelper {
    /**
     * يحاكي ذكاء اصطناعي في تظليل الكلمات المفتاحية
     * يحول النص من: "هذا **مفهوم مهم** جداً"
     * إلى نص ملون وعريض بشكل جذاب
     */
    fun highlightAI(text: String): Spanned {
        // 1. تظليل الكلمات بين النجوم **كلمة** بلون المنصة الأساسي
        val boldColor = "#6C5CE7"
        val pattern = "\\*\\*(.*?)\\*\\*".toRegex()
        
        val processedText = pattern.replace(text) { 
            "<b><font color='$boldColor'>${it.groupValues[1]}</font></b>"
        }

        // 2. تظليل الأرقام المهمة أو النسب المئوية بلون مختلف (اختياري)
        // يمكن إضافة المزيد من الأنماط الذكية هنا
        
        return HtmlCompat.fromHtml(processedText, HtmlCompat.FROM_HTML_MODE_LEGACY)
    }
}
