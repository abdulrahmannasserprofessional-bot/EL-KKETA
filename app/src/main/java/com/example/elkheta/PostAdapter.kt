package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class PostAdapter(private var posts: List<Post>, private val onPostClick: (Post) -> Unit) :
    RecyclerView.Adapter<PostAdapter.PostViewHolder>() {

    class PostViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvPostTitle)
        val description: TextView = view.findViewById(R.id.tvPostDescription)
        val actionText: TextView = view.findViewById(R.id.tvActionText)
        val icon: ImageView = view.findViewById(R.id.ivPostIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_post, parent, false)
        return PostViewHolder(view)
    }

    override fun onBindViewHolder(holder: PostViewHolder, position: Int) {
        val post = posts[position]
        holder.title.text = post.title
        holder.description.text = post.description
        
        when(post.type) {
            "VIDEO" -> {
                holder.icon.setImageResource(android.R.drawable.ic_media_play)
                holder.actionText.text = "مشاهدة الفيديو"
            }
            "PDF" -> {
                holder.icon.setImageResource(android.R.drawable.ic_menu_save)
                holder.actionText.text = "تحميل الملف"
            }
            else -> {
                holder.icon.setImageResource(android.R.drawable.ic_menu_info_details)
                holder.actionText.text = "عرض التفاصيل"
            }
        }

        holder.itemView.setOnClickListener { onPostClick(post) }
    }

    override fun getItemCount() = posts.size

    fun updateList(newList: List<Post>) {
        posts = newList
        notifyDataSetChanged()
    }
}
