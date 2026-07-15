package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ClassAdapter(
    private var classes: List<ClassRoom>,
    private val onDelete: (ClassRoom) -> Unit
) : RecyclerView.Adapter<ClassAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name: TextView = view.findViewById(R.id.tvClassName)
        val btnDelete: ImageButton = view.findViewById(R.id.btnDeleteClass)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_class_admin, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val classItem = classes[position]
        holder.name.text = classItem.name
        holder.btnDelete.setOnClickListener { onDelete(classItem) }
    }

    override fun getItemCount() = classes.size

    fun updateList(newList: List<ClassRoom>) {
        classes = newList
        notifyDataSetChanged()
    }
}
