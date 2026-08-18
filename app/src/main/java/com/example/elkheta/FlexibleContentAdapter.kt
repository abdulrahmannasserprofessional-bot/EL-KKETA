package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FlexibleContentAdapter(
    private var items: List<ContentItem>,
    private val onItemClick: (ContentItem) -> Unit
) : RecyclerView.Adapter<FlexibleContentAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvContentTitle)
        val typeLabel: TextView = view.findViewById(R.id.tvContentTypeLabel)
        val icon: ImageView = view.findViewById(R.id.ivContentTypeIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_content_flexible, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.title.text = item.title
        
        when (item.type) {
            "VIDEO" -> {
                holder.typeLabel.text = "فيديو تعليمي"
                holder.icon.setImageResource(android.R.drawable.ic_media_play)
            }
            "EXAM" -> {
                holder.typeLabel.text = "اختبار إلكتروني"
                holder.icon.setImageResource(android.R.drawable.ic_menu_edit)
            }
            "PDF" -> {
                holder.typeLabel.text = "ملف PDF"
                holder.icon.setImageResource(android.R.drawable.ic_menu_save)
            }
        }

        holder.itemView.setOnClickListener { onItemClick(item) }
    }

    override fun getItemCount() = items.size

    fun updateList(newList: List<ContentItem>) {
        items = newList
        notifyDataSetChanged()
    }
}
