package com.example.elkheta

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class ManageCodesActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_codes_admin)

        val tvCode = findViewById<TextView>(R.id.tvNewGeneratedCode)
        val btnGenerate = findViewById<Button>(R.id.btnGenerateCode)
        val btnGeneratePDF = findViewById<Button>(R.id.btnGeneratePDF)
        val etCount = findViewById<EditText>(R.id.etBulkCount)
        val btnBack = findViewById<ImageView>(R.id.btnBack)

        btnBack.setOnClickListener { finish() }

        btnGenerate.setOnClickListener {
            val randomNum = (1000..9999).random()
            val randomCode = "KH$randomNum"
            tvCode.text = randomCode
            
            // حفظ الكود في Firebase
            CodeRepository.saveCodes(listOf(randomCode)) {
                Toast.makeText(this, "تم إنشاء وحفظ الكود: $randomCode", Toast.LENGTH_SHORT).show()
            }
        }

        tvCode.setOnClickListener {
            val code = tvCode.text.toString()
            if (code != "---") {
                val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText("Student Code", code)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this, "تم نسخ الكود", Toast.LENGTH_SHORT).show()
            }
        }

        btnGeneratePDF.setOnClickListener {
            val countStr = etCount.text.toString()
            val count = if (countStr.isNotEmpty()) countStr.toInt() else 10
            
            if (count > 200) {
                Toast.makeText(this, "الحد الأقصى للـ PDF هو 200 كود", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val generatedCodes = mutableListOf<String>()
            for (i in 1..count) {
                val randomNum = (1000..9999).random()
                generatedCodes.add("KH$randomNum")
            }
            
            // حفظ في Firebase أولاً
            CodeRepository.saveCodes(generatedCodes) { success ->
                if (success) {
                    createColorfulPDF(generatedCodes)
                } else {
                    Toast.makeText(this, "فشل حفظ الأكواد في السيرفر", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun createColorfulPDF(codes: List<String>) {
        val pdfDocument = PdfDocument()
        val paint = Paint()
        val titlePaint = Paint()

        // إعداد الصفحة (A4 تقريباً)
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        var page = pdfDocument.startPage(pageInfo)
        var canvas = page.canvas

        // خلفية الهيدر
        paint.color = Color.parseColor("#6C5CE7")
        canvas.drawRect(0f, 0f, 595f, 100f, paint)

        // عنوان الـ PDF
        titlePaint.color = Color.WHITE
        titlePaint.textSize = 24f
        titlePaint.isFakeBoldText = true
        canvas.drawText("Activation Codes - ELKHETA", 150f, 60f, titlePaint)

        var y = 150f
        val xPositions = listOf(50f, 200f, 350f, 500f) // 4 أعمدة
        
        codes.forEachIndexed { index, code ->
            if (y > 800f) { // صفحة جديدة إذا امتصت
                pdfDocument.finishPage(page)
                page = pdfDocument.startPage(pageInfo)
                canvas = page.canvas
                y = 50f
            }

            // رسم مربع ملون لكل كود
            paint.color = if (index % 2 == 0) Color.parseColor("#F4F7FF") else Color.WHITE
            val col = index % 4
            val x = xPositions[col]
            
            canvas.drawRect(x - 10, y - 25, x + 100, y + 10, paint)
            
            paint.color = Color.parseColor("#2D3436")
            paint.textSize = 14f
            canvas.drawText(code, x, y, paint)

            if (col == 3) y += 50f // الانتقال لسطر جديد بعد 4 أعمدة
        }

        pdfDocument.finishPage(page)

        // حفظ الملف
        val fileName = "Codes_${System.currentTimeMillis()}.pdf"
        val file = File(getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), fileName)

        try {
            pdfDocument.writeTo(FileOutputStream(file))
            Toast.makeText(this, "تم إنشاء ملف PDF بنجاح", Toast.LENGTH_LONG).show()
            sharePDF(file)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "خطأ في إنشاء الملف: ${e.message}", Toast.LENGTH_SHORT).show()
        } finally {
            pdfDocument.close()
        }
    }

    private fun sharePDF(file: File) {
        val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
        val intent = Intent(Intent.ACTION_SEND)
        intent.type = "application/pdf"
        intent.putExtra(Intent.EXTRA_STREAM, uri)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        startActivity(Intent.createChooser(intent, "مشاركة ملف الأكواد"))
    }
}
