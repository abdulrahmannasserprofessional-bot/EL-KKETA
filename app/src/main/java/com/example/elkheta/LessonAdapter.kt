package com.example.elkheta

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.database.FirebaseDatabase

class LessonAdapter(private val lessons: List<Lesson>) :
    RecyclerView.Adapter<LessonAdapter.LessonViewHolder>() {

    class LessonViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvLessonTitle)
        val duration: TextView = view.findViewById(R.id.tvDuration)
        val btnVideo: Button = view.findViewById(R.id.btnVideo)
        val btnPdf: Button = view.findViewById(R.id.btnPdf)
        val btnExam: Button = view.findViewById(R.id.btnExam)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LessonViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_lesson, parent, false)
        return LessonViewHolder(view)
    }

    override fun onBindViewHolder(holder: LessonViewHolder, position: Int) {
        val lesson = lessons[position]
        holder.title.text = lesson.title
        holder.duration.text = lesson.duration

        holder.btnVideo.setOnClickListener {
            if (lesson.videoUrl.isNotEmpty()) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(lesson.videoUrl))
                holder.itemView.context.startActivity(intent)
            } else {
                Toast.makeText(holder.itemView.context, "فيديو غير متوفر حالياً", Toast.LENGTH_SHORT).show()
            }
        }

        holder.btnPdf.setOnClickListener {
            if (lesson.pdfUrl.isNotEmpty()) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(lesson.pdfUrl))
                holder.itemView.context.startActivity(intent)
            } else {
                Toast.makeText(holder.itemView.context, "الملزمة غير متوفرة حالياً", Toast.LENGTH_SHORT).show()
            }
        }

        holder.btnExam.setOnClickListener {
            if (lesson.hasExam) {
                // جلب الامتحان من Firebase
                fetchExamAndStartQuiz(holder.itemView.context)
            } else {
                Toast.makeText(holder.itemView.context, "لا يوجد امتحان لهذه المحاضرة", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun fetchExamAndStartQuiz(context: Context) {
        val database = FirebaseDatabase.getInstance().getReference("Exams")
        database.child("current_exam").get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                val quizJson = snapshot.value.toString()
                val intent = Intent(context, QuizActivity::class.java)
                intent.putExtra("QUIZ_JSON", quizJson)
                context.startActivity(intent)
            } else {
                Toast.makeText(context, "لم يتم رفع الامتحان بعد", Toast.LENGTH_SHORT).show()
            }
        }.addOnFailureListener {
            Toast.makeText(context, "خطأ في الاتصال", Toast.LENGTH_SHORT).show()
        }
    }

    override fun getItemCount() = lessons.size
}
