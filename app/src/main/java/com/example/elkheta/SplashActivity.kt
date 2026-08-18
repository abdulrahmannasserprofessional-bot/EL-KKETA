package com.example.elkheta

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.net.URL

class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val startTime = System.currentTimeMillis()

        checkUpdate { hasUpdate, updateUrl ->
            val elapsed = System.currentTimeMillis() - startTime
            val remaining = 1400 - elapsed
            
            Handler(Looper.getMainLooper()).postDelayed({
                if (hasUpdate) {
                    showUpdateDialog(updateUrl)
                } else {
                    startNextActivity()
                }
            }, if (remaining > 0) remaining else 0)
        }
    }

    private fun checkUpdate(onResult: (Boolean, String) -> Unit) {
        val currentVersionCode = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageManager.getPackageInfo(packageName, 0).longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0).versionCode
            }
        } catch (e: Exception) { 1 }

        val githubApiUrl = "https://api.github.com/repos/abdulrahmannasserprofessional-bot/EL-KKETA/releases/latest"

        Thread {
            try {
                val jsonResponse = URL(githubApiUrl).readText()
                val jsonObject = JSONObject(jsonResponse)
                val latestTag = jsonObject.getString("tag_name").filter { it.isDigit() }.toIntOrNull() ?: 1
                
                if (latestTag > currentVersionCode) {
                    onResult(true, "https://github.com/abdulrahmannasserprofessional-bot/EL-KKETA/releases/latest")
                } else {
                    onResult(false, "")
                }
            } catch (e: Exception) {
                onResult(false, "")
            }
        }.start()
    }

    private fun showUpdateDialog(url: String) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_update, null)
        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(false)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialogView.findViewById<android.widget.Button>(R.id.btnUpdateNow).setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
            startActivity(intent)
            finish()
        }
        dialog.show()
    }

    private fun startNextActivity() {
        val nextIntent = if (SessionManager.isRemembered(this)) {
            Intent(this, MainActivity::class.java).apply {
                putExtra("USER_NAME", SessionManager.getStudentName(this@SplashActivity))
            }
        } else {
            Intent(this, LoginActivity::class.java)
        }
        startActivity(nextIntent)
        finish()
    }
}
