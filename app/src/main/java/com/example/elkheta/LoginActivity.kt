package com.example.elkheta

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.google.firebase.database.FirebaseDatabase
import java.net.NetworkInterface
import java.util.Collections
import java.util.Locale

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // التحقق من تسجيل الدخول المسبق (تذكرني)
        if (SessionManager.isRemembered(this)) {
            val name = SessionManager.getStudentName(this)
            val intent = Intent(this, MainActivity::class.java)
            intent.putExtra("USER_NAME", name)
            startActivity(intent)
            finish()
            return
        }

        setContentView(R.layout.activity_login)
        
        requestLocationPermissions()
        checkUpdate()

        val etStudentCode = findViewById<EditText>(R.id.etStudentCode)
        val cbRememberMe = findViewById<CheckBox>(R.id.cbRememberMe)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val tvGoToRegister = findViewById<TextView>(R.id.tvGoToRegister)
        val adminAccessLayout = findViewById<LinearLayout>(R.id.adminAccessLayout)
        
        // أزرار التواصل الاجتماعي
        findViewById<ImageView>(R.id.ivWhatsAppUpdates).setOnClickListener {
            openSocial("https://chat.whatsapp.com/DkMNxi1wDq3APscsSGBoFn")
        }
        findViewById<ImageView>(R.id.ivWhatsApp).setOnClickListener {
            openSocial("https://wa.me/201158210358")
        }
        findViewById<ImageView>(R.id.ivTelegram).setOnClickListener {
            openSocial("https://t.me/+201158210358")
        }

        btnLogin.setOnClickListener {
            val code = etStudentCode.text.toString().trim().uppercase()
            val remember = cbRememberMe.isChecked
            if (code.isNotEmpty()) {
                checkStudentCode(code, remember)
            } else {
                etStudentCode.error = "من فضلك أدخل كود الطالب"
            }
        }

        tvGoToRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        adminAccessLayout.setOnClickListener {
            // الدخول لبوابة المسؤولين عبر صفحة التأمين
            val intent = Intent(this, AdminGateActivity::class.java)
            startActivity(intent)
        }
    }

    private fun openSocial(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "التطبيق غير مثبت", Toast.LENGTH_SHORT).show()
        }
    }

    private fun requestLocationPermissions() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 100)
        }
    }

    private fun checkUpdate() {
        val currentVersionCode = try {
            packageManager.getPackageInfo(packageName, 0).versionCode
        } catch (e: Exception) { 1 }

        // بيانات جيت هب الخاصة بك
        val githubOwner = "abdulrahman-nasser" // استبدله باسم المستخدم الخاص بك
        val githubRepo = "ELKKETA" // استبدله باسم المستودع الخاص بك
        val url = "https://api.github.com/repos/$githubOwner/$githubRepo/releases/latest"

        Thread {
            try {
                val response = java.net.URL(url).readText()
                val jsonObject = com.google.gson.JsonParser.parseString(response).asJsonObject
                
                // نفترض أنك تسمي التاج برقم النسخة مثل "1" أو "2" أو "v1"
                val tagName = jsonObject.get("tag_name").asString.replace("v", "")
                val latestVersionCode = tagName.toIntOrNull() ?: 0
                
                // رابط تحميل ملف APK الأول من الـ Assets
                val assets = jsonObject.getAsJsonArray("assets")
                if (assets.size() > 0) {
                    val downloadUrl = assets.get(0).asJsonObject.get("browser_download_url").asString

                    if (latestVersionCode > currentVersionCode) {
                        runOnUiThread {
                            showUpdateDialog(downloadUrl)
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                // في حال فشل جيت هب (بسبب حدود الطلبات)، يمكننا العودة لـ Firebase كبديل
                runOnUiThread { checkUpdateFallback() }
            }
        }.start()
    }

    private fun checkUpdateFallback() {
        val currentVersionCode = try {
            packageManager.getPackageInfo(packageName, 0).versionCode
        } catch (e: Exception) { 1 }

        FirebaseDatabase.getInstance().getReference("Settings")
            .get().addOnSuccessListener { snapshot ->
                val minVersionVal = snapshot.child("minVersion").value
                val minVersion = minVersionVal?.toString()?.toIntOrNull() ?: 0
                val updateUrlVal = snapshot.child("updateUrl").value
                val updateUrl = updateUrlVal?.toString() ?: ""

                if (currentVersionCode < minVersion) {
                    showUpdateDialog(updateUrl)
                }
            }
    }

    private fun showUpdateDialog(url: String) {
        AlertDialog.Builder(this)
            .setTitle("تحديث جديد متاح! 🚀")
            .setMessage("يوجد تحديث هام للمنصة، يرجى تحميل النسخة الجديدة للمتابعة.")
            .setCancelable(false)
            .setPositiveButton("تحديث الآن") { _, _ ->
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                finish()
            }
            .show()
    }

    private fun checkStudentCode(code: String, remember: Boolean) {
        val upperCode = code.uppercase()
        StudentRepository.checkLogin(upperCode) { student ->
            if (student != null) {
                SessionManager.startSession(this, student.studentCode, student.fullName, remember)
                
                // جلب بيانات الجهاز بشكل محسن
                val deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}"
                val ipAddress = getIPAddress()
                val connectionType = getConnectionType(this)
                val locationStr = getLastKnownLocation()
                
                // تحديث بيانات الجهاز والموقع في السيرفر
                StudentRepository.updateDeviceInfo(upperCode, deviceModel, ipAddress, connectionType, locationStr)
                
                Toast.makeText(this, "مرحباً بك يا ${student.fullName}", Toast.LENGTH_SHORT).show()
                val intent = Intent(this, MainActivity::class.java)
                intent.putExtra("USER_NAME", student.fullName)
                startActivity(intent)
                finish()
            } else {
                // إذا لم يكن طالب مسجل، نتحقق هل هو كود تفعيل (KH) صالح؟
                CodeRepository.validateCode(upperCode) { isValid ->
                    if (isValid) {
                        val intent = Intent(this, CodeActivationActivity::class.java)
                        intent.putExtra("ACTIVATION_CODE", upperCode)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this, "عذراً، هذا الكود غير صحيح أو مستخدم مسبقاً", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun getLastKnownLocation(): String {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return "Permission Denied"
        }
        val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        val providers = locationManager.getProviders(true)
        var bestLocation: Location? = null
        
        for (provider in providers) {
            val l = try { locationManager.getLastKnownLocation(provider) } catch (e: SecurityException) { null } ?: continue
            if (bestLocation == null || l.accuracy < bestLocation.accuracy) {
                bestLocation = l
            }
        }
        
        if (bestLocation != null) {
            return try {
                val geocoder = Geocoder(this, Locale("ar"))
                val addresses = geocoder.getFromLocation(bestLocation.latitude, bestLocation.longitude, 1)
                if (addresses != null && addresses.isNotEmpty()) {
                    val address = addresses[0]
                    "${address.adminArea ?: ""} - ${address.locality ?: ""}".trim().ifEmpty { "${bestLocation.latitude}, ${bestLocation.longitude}" }
                } else {
                    "${bestLocation.latitude}, ${bestLocation.longitude}"
                }
            } catch (e: Exception) {
                "${bestLocation.latitude}, ${bestLocation.longitude}"
            }
        }
        return "جاري التحديد..."
    }

    private fun getIPAddress(): String {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            for (intf in interfaces) {
                val addrs = Collections.list(intf.inetAddresses)
                for (addr in addrs) {
                    if (!addr.isLoopbackAddress) {
                        val sAddr = addr.hostAddress ?: ""
                        val isIPv4 = sAddr.indexOf(':') < 0
                        if (isIPv4) return sAddr
                        else {
                            val delim = sAddr.indexOf('%')
                            return if (delim < 0) sAddr.uppercase() else sAddr.substring(0, delim).uppercase()
                        }
                    }
                }
            }
        } catch (e: Exception) { }
        return "127.0.0.1"
    }

    private fun getConnectionType(context: Context): String {
        val cm = context.getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = cm.activeNetwork ?: return "No Network"
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return "No Network"
        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Mobile Data"
            else -> "Other"
        }
    }
}
