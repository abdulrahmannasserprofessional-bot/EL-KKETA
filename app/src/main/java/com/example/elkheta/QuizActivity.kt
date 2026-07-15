package com.example.elkheta

import android.graphics.Color
import android.os.Bundle
import android.os.CountDownTimer
import android.text.Html
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView

class QuizActivity : androidx.appcompat.app.AppCompatActivity() {
    private lateinit var questions: List<Question>
    private var currentIndex = 0
    private var currentSubject = "فيزياء"
    private var timer: CountDownTimer? = null
    private val examDurationMillis: Long = 5 * 60 * 1000 // 5 دقائق

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_quiz)

        // محاكاة بيانات JSON عشوائية (الاقتراح 1)
        val rawQuestions = listOf(
            Question("1", "ما هي وحدة قياس القوة؟", listOf("نيوتن", "جول", "وات", "فولت"), 0, "وحدة القياس هي **النيوتن** نسبة للعالم إسحاق نيوتن."),
            Question("2", "السرعة هي المسافة مقسومة على...؟", listOf("الكتلة", "الزمن", "القوة", "العجلة"), 1, "السرعة تساوي **المسافة** على **الزمن**."),
            Question("3", "الجسم الساكن يبقى ساكناً ما لم تؤثر عليه قوة.. هذا قانون؟", listOf("نيوتن الأول", "نيوتن الثاني", "نيوتن الثالث", "أرشميدس"), 0, "هذا هو **قانون نيوتن الأول** أو قانون القصور الذاتي.")
        )
        
        // عشوائية الأسئلة وترتيبها لكل طالب
        questions = rawQuestions.shuffled()

        startTimer()
        showQuestion()
    }

    private fun startTimer() {
        val tvTimer = findViewById<TextView>(R.id.tvTimer)
        timer = object : android.os.CountDownTimer(examDurationMillis, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val minutes = (millisUntilFinished / 1000) / 60
                val seconds = (millisUntilFinished / 1000) % 60
                tvTimer.text = String.format("%02d:%02d", minutes, seconds)
                
                // تحذير باللون الأحمر عند بقاء أقل من دقيقة
                if (millisUntilFinished < 60000) {
                    tvTimer.setTextColor(Color.RED)
                }
            }

            override fun onFinish() {
                tvTimer.text = "00:00"
                autoSubmitExam()
            }
        }.start()
    }

    private fun autoSubmitExam() {
        Toast.makeText(this, "⏳ انتهى الوقت! تم حفظ إجاباتك وإرسال الامتحان تلقائياً.", Toast.LENGTH_LONG).show()
        // منطق إنهاء الامتحان تلقائياً
        finish()
    }

    private fun showQuestion() {
        if (currentIndex >= questions.size) {
            finish()
            return
        }
        
        val question = questions[currentIndex]
        findViewById<TextView>(R.id.tvQuestionProgress).text = "السؤال ${currentIndex + 1} من ${questions.size}"
        findViewById<TextView>(R.id.tvQuestionText).text = question.text
        findViewById<MaterialCardView>(R.id.cardFeedback).visibility = View.GONE

        val container = findViewById<LinearLayout>(R.id.optionsContainer)
        container.removeAllViews()

        question.options.forEachIndexed { index, option ->
            val button = Button(this).apply {
                text = option
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    setMargins(0, 0, 0, 10)
                }
                setOnClickListener { checkAnswer(index) }
            }
            container.addView(button)
        }
    }

    private fun checkAnswer(selectedIndex: Int) {
        val question = questions[currentIndex]
        val isCorrect = selectedIndex == question.correctAnswerIndex
        
        val feedbackCard = findViewById<MaterialCardView>(R.id.cardFeedback)
        val statusTv = findViewById<TextView>(R.id.tvFeedbackStatus)
        val explanationTv = findViewById<TextView>(R.id.tvExplanation)
        
        feedbackCard.visibility = View.VISIBLE
        
        // تعطيل الأزرار لمنع تغيير الإجابة بعد ظهور التصويب
        val container = findViewById<LinearLayout>(R.id.optionsContainer)
        for (i in 0 until container.childCount) {
            container.getChildAt(i).isEnabled = false
        }
        
        if (isCorrect) {
            statusTv.text = "إجابة صحيحة ✅"
            statusTv.setTextColor(Color.GREEN)
            addPointsToStudent(10)
        } else {
            statusTv.text = "إجابة خاطئة ❌"
            statusTv.setTextColor(Color.RED)
            
            val mistake = StudentMistake(
                subjectName = currentSubject,
                questionText = question.text,
                userAnswer = question.options[selectedIndex],
                correctAnswer = question.options[question.correctAnswerIndex],
                explanation = question.explanation
            )
            MistakeRepository.saveMistake(this, mistake)
        }

        val finalHtml = highlightKeywords(question.explanation)
        explanationTv.text = Html.fromHtml(finalHtml, Html.FROM_HTML_MODE_COMPACT)

        findViewById<Button>(R.id.btnNextQuestion).setOnClickListener {
            if (currentIndex < questions.size - 1) {
                currentIndex++
                showQuestion()
            } else {
                timer?.cancel()
                Toast.makeText(this, "🎉 أحسنت! أنهيت الامتحان بنجاح.", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        timer?.cancel()
    }

    private fun addPointsToStudent(points: Int) {
        val code = SessionManager.getStudentCode(this)
        if (code != null) {
            StudentRepository.addPoints(code, points)
        }
    }

    private fun highlightKeywords(text: String): String {
        // تحويل **كلمة** إلى HTML Bold ملون
        val regex = "\\*\\*(.*?)\\*\\*".toRegex()
        return regex.replace(text) { 
            "<b><font color='#6C5CE7'>${it.groupValues[1]}</font></b>"
        }
    }
}
