package com.example.elkheta

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class StudentAdapter(
    private var students: List<User>,
    private val onDelete: (User) -> Unit
) : RecyclerView.Adapter<StudentAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val name: TextView = view.findViewById(R.id.tvStudentName)
        val code: TextView = view.findViewById(R.id.tvStudentCode)
        val deviceInfo: TextView = view.findViewById(R.id.tvDeviceInfo)
        val connectionInfo: TextView = view.findViewById(R.id.tvConnectionInfo)
        val locationInfo: TextView = view.findViewById(R.id.tvLocationInfo)
        val btnDelete: ImageView = view.findViewById(R.id.btnDeleteStudent)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_student_admin, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val student = students[position]
        holder.name.text = student.fullName
        holder.code.text = "الكود: ${student.studentCode}"
        
        // عرض بيانات الجهاز (الموديل)
        holder.deviceInfo.text = "الجهاز: ${if (student.deviceModel.isEmpty()) "غير معروف" else student.deviceModel}"
        
        // عرض بيانات الاتصال والـ IP
        val conn = if (student.connectionType.isEmpty()) "N/A" else student.connectionType
        val ip = if (student.ipAddress.isEmpty()) "Unknown" else student.ipAddress
        holder.connectionInfo.text = "الاتصال: $conn | IP: $ip"

        // عرض الموقع الجغرافي
        holder.locationInfo.text = "الموقع: ${if (student.location.isEmpty()) "غير محدد" else student.location}"

        holder.btnDelete.setOnClickListener { onDelete(student) }
    }

    override fun getItemCount() = students.size

    fun updateList(newList: List<User>) {
        students = newList
        notifyDataSetChanged()
    }
}
