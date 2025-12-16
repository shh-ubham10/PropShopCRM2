package com.propshop.crm

import android.app.*
import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.propshop.crm.network.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File

class CallRecordingService : Service() {

    private var recorder: MediaRecorder? = null
    private lateinit var outputFile: File

    private var phoneNumber: String = ""
    private var callStartTime: String = ""

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        phoneNumber = intent?.getStringExtra("number") ?: ""
        callStartTime = intent?.getStringExtra("time") ?: ""

        when (intent?.getStringExtra("action")) {
            "start" -> startRecording()
            "stop" -> stopRecording()
        }

        return START_NOT_STICKY
    }

    private fun startRecording() {
        createNotification()

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
        } catch (_: Exception) {}

        recorder?.release()
        recorder = null

        stopForeground(true)

        uploadToServer()

        stopSelf()
    }

    private fun uploadToServer() {
        val duration = "20" // TODO: auto-calculate later

        // NEW OKHTTP 5 FORMAT
        val requestFile = RequestBody.create(
            "audio/*".toMediaType(),
            outputFile
        )

        val audioPart = MultipartBody.Part.createFormData(
            "audioFile",
            outputFile.name,
            requestFile
        )

        val numberPart = RequestBody.create("text/plain".toMediaType(), phoneNumber)
        val timePart = RequestBody.create("text/plain".toMediaType(), callStartTime)
        val durationPart = RequestBody.create("text/plain".toMediaType(), duration)

        val api = RetrofitClient.instance.create(ApiService::class.java)

        api.uploadCall(audioPart, numberPart, timePart, durationPart)
            .enqueue(object : Callback<UploadResponse> {
                override fun onResponse(call: Call<UploadResponse>, response: Response<UploadResponse>) {
                    // success
                }

                override fun onFailure(call: Call<UploadResponse>, t: Throwable) {
                    t.printStackTrace()
                }
            })
    }

    private fun createNotification() {
        val channelId = "call_recording_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Call Recording",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Recording Call")
            .setContentText("Call recording active…")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .build()

        startForeground(1, notification)
    }
}
