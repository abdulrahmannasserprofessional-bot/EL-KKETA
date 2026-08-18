package com.example.elkheta

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.*
import android.widget.ImageButton
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity

class VideoPlayerActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var videoId: String = ""

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_player)

        videoId = intent.getStringExtra("VIDEO_ID") ?: ""
        webView = findViewById(R.id.webViewPlayer)
        val progressBar = findViewById<ProgressBar>(R.id.playerProgress)
        val btnClose = findViewById<ImageButton>(R.id.btnClosePlayer)

        btnClose.setOnClickListener { finish() }

        webView.settings.javaScriptEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        
        // منع النسخ والتحميل بقدر الإمكان في WebView
        webView.setOnLongClickListener { true }
        webView.isLongClickable = false

        val savedPos = PlaybackManager.getPosition(this, videoId)

        val html = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#000;">
                <div id="player"></div>
                <script>
                    var tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    var firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                    var player;
                    function onYouTubeIframeAPIReady() {
                        player = new YT.Player('player', {
                            height: '100%',
                            width: '100%',
                            videoId: '$videoId',
                            playerVars: { 
                                'start': $savedPos,
                                'modestbranding': 1,
                                'rel': 0,
                                'controls': 1
                            },
                            events: {
                                'onReady': onPlayerReady,
                                'onStateChange': onPlayerStateChange
                            }
                        });
                    }

                    function onPlayerReady(event) {
                        // Player ready
                    }

                    function onPlayerStateChange(event) {
                        // Notify Android of time periodically or on pause
                    }

                    // Function called from Android to get current time
                    function getCurrentTime() {
                        return player.getCurrentTime();
                    }
                </script>
            </body>
            </html>
        """.trimIndent()

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress == 100) progressBar.visibility = android.view.View.GONE
            }
        }

        webView.loadDataWithBaseURL("https://www.youtube.com", html, "text/html", "UTF-8", null)
    }

    override fun onPause() {
        super.onPause()
        // حفظ مكان التوقف عند الخروج أو التوقف
        webView.evaluateJavascript("(function() { return player.getCurrentTime(); })();") { value ->
            val time = value.replace("\"", "").toDoubleOrNull()?.toLong() ?: 0L
            if (time > 0) {
                PlaybackManager.savePosition(this, videoId, time)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }
}
