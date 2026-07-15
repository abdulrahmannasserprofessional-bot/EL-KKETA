package com.example.elkheta

import android.text.Html
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class MistakesAdapter(private val mistakes: List<StudentMistake>) :
    RecyclerView.Adapter<MistakesAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val subject: TextView = view.findViewById(R.id.tvMistakeSubject)
        val question: TextView = view.findViewById(R.id.tvMistakeQuestion)
        val explanation: TextView = view.findViewById(R.id.tvMistakeExplanation)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_mistake, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val mistake = mistakes[position]
        holder.subject.text = mistake.subjectName
        holder.question.text = mistake.questionText
        
        val htmlContent = highlightKeywords(mistake.explanation)
        holder.explanation.text = Html.fromHtml("<b>التصويب: </b>" + htmlContent, Html.FROM_HTML_MODE_COMPACT)
    }

    override fun getItemCount() = mistakes.size

    private fun highlightKeywords(text: String): String {
        val regex = "\\*\\*(.*?)\\*\\*".toRegex()
        return regex.replace(text) { 
            "<b><font color='#6C5CE7'>${it.groupValues[1]}</font></b>"
        }
    }
}
