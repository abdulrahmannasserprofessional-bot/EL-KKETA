package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ContentAdapter(
    private var contents: List<Exam>,
    private val onEdit: (Exam) -> Unit,
    private val onDelete: (Exam) -> Unit
) : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvContentTitle)
        val subtitle: TextView = view.findViewById(R.id.tvContentSubtitle)
        val btnEdit: ImageButton = view.findViewById(R.id.btnEditContent)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDeleteContent)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_content_admin, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val content = contents[position]
        holder.title.text = content.title
        holder.subtitle.text = "${content.chapter} - امتحان برمجى"

        holder.btnEdit.setOnClickListener { onEdit(content) }
        holder.btnDelete.setOnClickListener { onDelete(content) }
    }

    override fun getItemCount() = contents.size

    fun updateList(newList: List<Exam>) {
        contents = newList
        notifyDataSetChanged()
    }
}
