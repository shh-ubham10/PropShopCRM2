package com.propshop.crm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Environment
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import java.io.File

class CallReceiver : BroadcastReceiver() {

    private var callStartTime: Long = 0
    private var savedNumber: String = ""
    private var wasInCall = false

    override fun onReceive(context: Context, intent: Intent) {

        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val incomingNumber =
            intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: ""

        when (stateStr) {

            TelephonyManager.EXTRA_STATE_RINGING -> {
                savedNumber = incomingNumber
            }

            TelephonyManager.EXTRA_STATE_OFFHOOK -> {

                wasInCall = true
                callStartTime = System.currentTimeMillis()

                if (savedNumber.isEmpty()) {
                    savedNumber = incomingNumber.ifEmpty { "Unknown" }
                }

                // ▶️ Start call recording
                val startIntent =
                    Intent(context, CallRecordingService::class.java).apply {
                        putExtra("action", "start")
                        putExtra("number", savedNumber)
                        putExtra("time", callStartTime.toString())
                    }

                ContextCompat.startForegroundService(context, startIntent)
            }

            TelephonyManager.EXTRA_STATE_IDLE -> {

                if (!wasInCall) return
                wasInCall = false

                // ⏹ Stop recording
                val stopIntent =
                    Intent(context, CallRecordingService::class.java).apply {
                        putExtra("action", "stop")
                    }

                ContextCompat.startForegroundService(context, stopIntent)

                // ☁️ Auto upload last call
                uploadLastRecordedCall(context)

                savedNumber = ""
            }
        }
    }

    /* ---------------- AUTO UPLOAD ---------------- */

    private fun uploadLastRecordedCall(context: Context) {

        val session = SessionManager(context)
        if (!session.isLoggedIn()) return

        val filePath = getLastRecordedCallPath()
        if (filePath.isEmpty()) return

        val fileUri = android.net.Uri.fromFile(File(filePath))

        val metadata = """
            {
              "employeeId": ${session.getUserId()},
              "phoneNumber": "$savedNumber",
              "startTime": $callStartTime,
              "endTime": ${System.currentTimeMillis()},
              "callType": "outgoing"
            }
        """.trimIndent()

        CallUploadWorker.enqueue(
            context = context,
            fileUri = fileUri,
            metadataJson = metadata
        )
    }

    private fun getLastRecordedCallPath(): String {

        val dir = File(
            Environment.getExternalStorageDirectory(),
            "CallRecordings"
        )

        return dir.listFiles()
            ?.maxByOrNull { it.lastModified() }
            ?.absolutePath
            ?: ""
    }
}
