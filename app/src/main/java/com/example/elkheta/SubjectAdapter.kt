package com.example.elkheta

import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class SubjectAdapter(
    private var subjects: List<Subject>,
    private val isAdmin: Boolean = false,
    private val onDeleteClick: ((Subject) -> Unit)? = null
) : RecyclerView.Adapter<SubjectAdapter.SubjectViewHolder>() {

    class SubjectViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name: TextView = view.findViewById(R.id.tvSubjectName)
        val icon: ImageView = view.findViewById(R.id.ivSubjectIcon)
        val btnDelete: ImageView? = view.findViewById(R.id.btnDeleteSubject)
        // الحاوية التي تحمل الخلفية الملونة
        val container: View? = view.findViewById(R.id.clSubjectContainer) ?: view.findViewById(R.id.rlBackground)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SubjectViewHolder {
        val layout = if (isAdmin) R.layout.item_subject_admin else R.layout.item_subject
        val view = LayoutInflater.from(parent.context)
            .inflate(layout, parent, false)
        return SubjectViewHolder(view)
    }

    override fun onBindViewHolder(holder: SubjectViewHolder, position: Int) {
        val subject = subjects[position]
        holder.name.text = subject.name
        
        holder.icon.setImageResource(R.drawable.ic_book_stack)

        if (!isAdmin && holder.container != null) {
            when {
                subject.name.contains("عربي") || subject.name.contains("لغة") -> {
                    holder.container.setBackgroundResource(R.drawable.bg_subject_purple)
                }
                subject.name.contains("رياض") || subject.name.contains("حساب") -> {
                    holder.container.setBackgroundResource(R.drawable.bg_subject_blue)
                }
                subject.name.contains("إنجليزي") || subject.name.contains("English") -> {
                    holder.container.setBackgroundResource(R.drawable.bg_subject_orange)
                }
                subject.name.contains("علوم") || subject.name.contains("فيزياء") || subject.name.contains("كيمياء") -> {
                    holder.container.setBackgroundResource(R.drawable.bg_subject_green)
                }
                else -> {
                    holder.container.setBackgroundResource(R.drawable.bg_subject_purple)
                }
            }
        }

        if (isAdmin) {
            holder.btnDelete?.setOnClickListener {
                onDeleteClick?.invoke(subject)
            }
            holder.itemView.setOnClickListener {
                val intent = Intent(holder.itemView.context, ManageLecturesActivity::class.java)
                intent.putExtra("SUBJECT_NAME", subject.name)
                holder.itemView.context.startActivity(intent)
            }
        } else {
            holder.itemView.setOnClickListener {
                val intent = Intent(holder.itemView.context, LessonsActivity::class.java)
                intent.putExtra("SUBJECT_NAME", subject.name)
                holder.itemView.context.startActivity(intent)
            }
        }
    }

    override fun getItemCount() = subjects.size

    fun updateList(newList: List<Subject>) {
        subjects = newList
        notifyDataSetChanged()
    }
}
