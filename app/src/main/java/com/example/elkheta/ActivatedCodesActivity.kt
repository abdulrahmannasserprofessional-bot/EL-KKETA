package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.database.FirebaseDatabase

class ActivatedCodesActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_activated_codes)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvActivatedCodes)
        rv.layoutManager = LinearLayoutManager(this)

        fetchActivatedCodes { list ->
            rv.adapter = ActivatedCodesAdapter(list)
        }
    }

    private fun fetchActivatedCodes(onResult: (List<Map<String, Any>>) -> Unit) {
        FirebaseDatabase.getInstance().getReference("ActivationCodes")
            .orderByChild("isUsed").equalTo(true)
            .get().addOnSuccessListener { snapshot ->
                val list = mutableListOf<Map<String, Any>>()
                snapshot.children.forEach { child ->
                    val map = mutableMapOf<String, Any>()
                    map["code"] = child.key ?: ""
                    map["usedBy"] = child.child("usedBy").value ?: ""
                    map["phone"] = child.child("phone").value ?: ""
                    list.add(map)
                }
                onResult(list)
            }
    }
}
