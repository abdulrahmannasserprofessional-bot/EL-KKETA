package com.example.elkheta

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import com.google.android.material.card.MaterialCardView

class HomeFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)

        val userName = activity?.intent?.getStringExtra("USER_NAME") ?: "طالب"
        view.findViewById<TextView>(R.id.tvUserName).text = "أهلاً بك يا $userName"

        // عرض آخر تنبيه
        val tvNotice = view.findViewById<TextView>(R.id.tvNoticeText)
        NotificationRepository.getLatestNotification { message ->
            tvNotice.text = message
        }

        // إعداد الضغط على الكروت
        view.findViewById<MaterialCardView>(R.id.cardNotifications).setOnClickListener {
            startActivity(Intent(context, NotificationsActivity::class.java))
        }

        view.findViewById<MaterialCardView>(R.id.cardSubjects).setOnClickListener {
            startActivity(Intent(context, CoursesActivity::class.java))
        }

        view.findViewById<MaterialCardView>(R.id.cardMap).setOnClickListener {
            startActivity(Intent(context, CurriculumMapActivity::class.java))
        }

        view.findViewById<MaterialCardView>(R.id.cardMistakes).setOnClickListener {
            startActivity(Intent(context, MistakesActivity::class.java))
        }

        // فتح القائمة الجانبية
        view.findViewById<ImageView>(R.id.ivOpenDrawer).setOnClickListener {
            activity?.findViewById<DrawerLayout>(R.id.drawerLayout)?.openDrawer(GravityCompat.START)
        }

        // تسجيل الخروج
        view.findViewById<ImageView>(R.id.ivLogout).setOnClickListener {
            SessionManager.clear(requireContext())
            val intent = Intent(context, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            activity?.finish()
            Toast.makeText(context, "تم تسجيل الخروج", Toast.LENGTH_SHORT).show()
        }

        return view
    }
}
