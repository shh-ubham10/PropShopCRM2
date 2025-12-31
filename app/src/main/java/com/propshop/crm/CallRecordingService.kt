package com.propshop.crm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import java.io.File

class CallRecordingService : Service() {

    private var recorder: MediaRecorder? = null
    private lateinit var outputFile: File

    private var phoneNumber: String = ""
    private var callStartTime: Long = 0L

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        phoneNumber = intent?.getStringExtra("number") ?: phoneNumber

        intent?.getStringExtra("time")?.let {
            callStartTime = it.toLongOrNull() ?: System.currentTimeMillis()
        }

        when (intent?.getStringExtra("action")) {
            "start" -> startRecording()
            "stop" -> stopRecording()
        }

        return START_NOT_STICKY
    }

    private fun startRecording() {
        startForeground(201, createNotification())

        val folder = File(filesDir, "recordings")
        if (!folder.exists()) folder.mkdirs()

        outputFile = File(folder, "call_${System.currentTimeMillis()}.m4a")

        try {
            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioSamplingRate(44100)
                setAudioEncodingBitRate(128000)
                setOutputFile(outputFile.absolutePath)
                prepare()
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun stopRecording() {
        try {
            recorder?.stop()
        } catch (_: Exception) {
        }

        recorder?.release()
        recorder = null

        stopForeground(true)
        stopSelf()
    }

    private fun createNotification(): Notification {

        val channelId = "call_recording_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Call Recording",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("PropShop CRM")
            .setContentText("Call recording in progress")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .build()
    }
}
