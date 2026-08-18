package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class InquiryAdapter(
    private var inquiries: List<Inquiry>,
    private val onItemClick: (Inquiry) -> Unit
) : RecyclerView.Adapter<InquiryAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvInquiryTitle)
        val status: TextView = view.findViewById(R.id.tvInquiryStatus)
        val date: TextView = view.findViewById(R.id.tvInquiryDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_inquiry, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = inquiries[position]
        holder.title.text = if (item.message.isNotEmpty()) item.message else "استفسار صوتي/صورة"
        holder.status.text = if (item.isReplied) "تم الرد ✅" else "قيد الانتظار ⏳"
        holder.date.text = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(java.util.Date(item.timestamp))
        
        holder.itemView.setOnClickListener { onItemClick(item) }
    }

    override fun getItemCount() = inquiries.size

    fun updateList(newList: List<Inquiry>) {
        inquiries = newList
        notifyDataSetChanged()
    }
}
