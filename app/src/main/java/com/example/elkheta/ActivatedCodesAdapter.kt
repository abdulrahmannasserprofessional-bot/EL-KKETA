package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ActivatedCodesAdapter(private val codesList: List<Map<String, Any>>) :
    RecyclerView.Adapter<ActivatedCodesAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val code: TextView = view.findViewById(R.id.tvActivatedCode)
        val user: TextView = view.findViewById(R.id.tvUsedBy)
        val phone: TextView = view.findViewById(R.id.tvUsedPhone)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_activated_code, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = codesList[position]
        holder.code.text = item["code"].toString()
        holder.user.text = "بواسطة: ${item["usedBy"] ?: "غير معروف"}"
        holder.phone.text = "موبايل: ${item["phone"] ?: "غير متوفر"}"
    }

    override fun getItemCount() = codesList.size
}
