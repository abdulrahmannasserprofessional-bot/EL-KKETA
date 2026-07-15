package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class MistakesActivity : androidx.appcompat.app.AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_mistakes)

        findViewById<ImageView>(R.id.btnBackMistakes).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvMistakes)
        rv.layoutManager = LinearLayoutManager(this)
        
        val mistakes = MistakeRepository.getAllMistakes(this)
        rv.adapter = MistakesAdapter(mistakes)

        // تطبيق الاقتراح رقم 6: إحصائيات بنك الأخطاء
        updateMistakeStats(mistakes)
    }

    private fun updateMistakeStats(mistakes: List<StudentMistake>) {
        val tvMain = findViewById<TextView>(R.id.tvMainStat)
        val tvSub = findViewById<TextView>(R.id.tvSubStat)

        if (mistakes.isEmpty()) {
            tvMain.text = "سجلك نظيف! أحسنت 🌟"
            tvSub.text = "لا توجد أخطاء مسجلة حالياً"
            return
        }

        // إيجاد أكثر مادة فيها أخطاء
        val mostDifficultSubject = mistakes.groupBy { it.subjectName }
            .maxByOrNull { it.value.size }?.key ?: "المواد"

        val count = mistakes.filter { it.subjectName == mostDifficultSubject }.size

        tvMain.text = "أكثر مادة تحتاج تركيز: $mostDifficultSubject"
        tvSub.text = "لديك $count أخطاء في هذه المادة، ركز عليها في المراجعة!"
    }
}
