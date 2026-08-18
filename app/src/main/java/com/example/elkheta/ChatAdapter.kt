package com.example.elkheta

import android.graphics.Color
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.bumptech.glide.Glide

class ChatAdapter(private var messages: List<ChatMessage>, private val currentStudentCode: String) :
    RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {

    class ChatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val root: LinearLayout = view.findViewById(R.id.layoutMessageRoot)
        val card: MaterialCardView = view.findViewById(R.id.cardMessage)
        val name: TextView = view.findViewById(R.id.tvSenderName)
        val text: TextView = view.findViewById(R.id.tvChatText)
        val image: ImageView = view.findViewById(R.id.ivChatImage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat_message, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        val msg = messages[position]
        holder.text.text = msg.text
        holder.name.text = if (msg.isAdmin) "الإدارة 👑" else msg.senderName
        
        // تمييز رسائل الطالب نفسه
        if (msg.senderCode == currentStudentCode) {
            holder.root.gravity = Gravity.END
            holder.card.setCardBackgroundColor(Color.parseColor("#E8EAFF"))
            holder.name.visibility = View.GONE
        } else {
            holder.root.gravity = Gravity.START
            holder.card.setCardBackgroundColor(Color.WHITE)
            holder.name.visibility = View.VISIBLE
        }

        // تمييز رسائل الإدارة
        if (msg.isAdmin) {
            holder.name.setTextColor(Color.parseColor("#FFD700")) // Gold
        }

        if (msg.fileType == "image" && msg.fileUrl.isNotEmpty()) {
            holder.image.visibility = View.VISIBLE
            Glide.with(holder.itemView.context).load(msg.fileUrl).into(holder.image)
        } else {
            holder.image.visibility = View.GONE
        }
    }

    override fun getItemCount() = messages.size

    fun updateList(newList: List<ChatMessage>) {
        messages = newList
        notifyDataSetChanged()
    }
}
