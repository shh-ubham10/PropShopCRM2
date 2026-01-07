package com.propshop.crm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.File

class CallRecordingService : Service() {

    companion object {
        private const val CHANNEL_ID = "call_record_channel"
        private var isRecording = false   // 🔐 FINAL AUTHORITY
    }

    private var recorder: MediaRecorder? = null
    private var outputFile: File? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(1, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        val action = intent?.getStringExtra("action") ?: return START_NOT_STICKY

        when (action) {

            /* ---------------- START ---------------- */
            "start" -> {

                if (isRecording) {
                    Log.d("CRM_CALL", "Service start ignored - already recording")
                    return START_NOT_STICKY
                }

                isRecording = true

                val number = intent.getStringExtra("number") ?: "Unknown"
                val time = intent.getStringExtra("time") ?: System.currentTimeMillis().toString()

                startRecording(number, time)
            }

            /* ---------------- STOP ---------------- */
            "stop" -> {

                if (!isRecording) {
                    Log.d("CRM_CALL", "Service stop ignored - not recording")
                    stopSelf()
                    return START_NOT_STICKY
                }

                stopRecording()
            }
        }

        return START_NOT_STICKY
    }

    private fun startRecording(number: String, time: String) {

        try {
            val dir = getExternalFilesDir(null)
                ?: throw IllegalStateException("External dir not available")

            // ✅ ASSIGN TO CLASS VARIABLE (IMPORTANT)
            outputFile = File(dir, "call_${number}_$time.m4a")

            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFile!!.absolutePath)
                prepare()
                start()
            }

            // ✅ SAVE FILE PATH AFTER START
            getSharedPreferences("call_rec", Context.MODE_PRIVATE)
                .edit()
                .putString("last_file_path", outputFile!!.absolutePath)
                .apply()

            Log.d("CRM_CALL", "Recording started, file saved at: ${outputFile!!.absolutePath}")

        } catch (e: Exception) {
            Log.e("CRM_CALL", "Recording start failed", e)
        }
    }



    private fun stopRecording() {
        try {
            recorder?.apply {
                stop()
                reset()
                release()
            }
        } catch (e: Exception) {
            Log.e("CRM_CALL", "Stop recording failed", e)
        } finally {
            recorder = null
            Log.d("CRM_CALL", "Recording stopped")
        }
    }


    override fun onDestroy() {
        super.onDestroy()
        recorder?.release()
        recorder = null
        isRecording = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    /* ---------------- NOTIFICATION ---------------- */

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Call Recording",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PropShop CRM")
            .setContentText("Recording call…")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .build()
    }
}
