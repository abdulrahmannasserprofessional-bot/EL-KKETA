package com.example.elkheta

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class CurriculumMapActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_curriculum_map)

        findViewById<ImageView>(R.id.btnBackMap).setOnClickListener { finish() }

        val rv = findViewById<RecyclerView>(R.id.rvCurriculumMap)
        rv.layoutManager = LinearLayoutManager(this)

        loadMapData(rv)
    }

    private fun loadMapData(rv: RecyclerView) {
        val mapData = mutableListOf<Pair<String, List<Lesson>>>()
        
        // 1. جلب جميع المواد
        SubjectRepository.getSubjects { subjects ->
            if (subjects.isEmpty()) {
                rv.adapter = CurriculumMapAdapter(emptyList())
                return@getSubjects
            }

            var loadedCount = 0
            subjects.forEach { subject ->
                // 2. لكل مادة، جلب المحاضرات الخاصة بها
                LectureRepository.getLectures(subject.name) { lectures ->
                    mapData.add(Pair(subject.name, lectures))
                    loadedCount++
                    
                    // تحديث الواجهة عند اكتمال جلب كل المواد
                    if (loadedCount == subjects.size) {
                        rv.adapter = CurriculumMapAdapter(mapData)
                    }
                }
            }
        }
    }
}
