package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class AdminLectureAdapter(
    private var lectures: List<Lesson>,
    private val onDelete: (Lesson) -> Unit
) : RecyclerView.Adapter<AdminLectureAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvContentTitle)
        val subtitle: TextView = view.findViewById(R.id.tvContentSubtitle)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDeleteContent)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_content_admin, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val lecture = lectures[position]
        holder.title.text = lecture.title
        holder.subtitle.text = "مدة: ${lecture.duration} | امتحان: ${if (lecture.hasExam) "نعم" else "لا"}"
        
        holder.btnDelete.setOnClickListener { onDelete(lecture) }
    }

    override fun getItemCount() = lectures.size

    fun updateList(newList: List<Lesson>) {
        lectures = newList
        notifyDataSetChanged()
    }
}
