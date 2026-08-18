package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class TutorialAdapter(
    private val items: List<TutorialItem>,
    private val onItemClick: (TutorialItem) -> Unit
) : RecyclerView.Adapter<TutorialAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvContentTitle)
        val description: TextView = view.findViewById(R.id.tvContentTypeLabel)
        val icon: ImageView = view.findViewById(R.id.ivContentTypeIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        // نستخدم نفس التصميم المرن لأنه مناسب جداً لهذا الغرض
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_content_flexible, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.title.text = item.title
        holder.description.text = item.description
        holder.icon.setImageResource(item.iconRes)
        
        holder.itemView.setOnClickListener { onItemClick(item) }
    }

    override fun getItemCount() = items.size
}
