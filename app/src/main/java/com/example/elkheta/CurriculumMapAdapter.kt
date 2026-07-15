package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class CurriculumMapAdapter(private val mapData: List<Pair<String, List<Lesson>>>) :
    RecyclerView.Adapter<CurriculumMapAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val subjectTitle: TextView = view.findViewById(R.id.tvMapSubjectTitle)
        val lecturesSummary: TextView = view.findViewById(R.id.tvMapLecturesSummary)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_curriculum_map, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val (subject, lectures) = mapData[position]
        holder.subjectTitle.text = subject
        
        val summary = if (lectures.isEmpty()) {
            "لا توجد محاضرات مرفوعة حالياً"
        } else {
            lectures.joinToString("\n") { "• ${it.title}" }
        }
        holder.lecturesSummary.text = summary
    }

    override fun getItemCount() = mapData.size
}
