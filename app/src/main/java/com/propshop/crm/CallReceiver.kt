package com.propshop.crm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.telephony.TelephonyManager
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat
import java.io.File

class CallReceiver : BroadcastReceiver() {

    private var callStartTime: Long = 0L
    private var savedNumber: String = ""

    override fun onReceive(context: Context, intent: Intent) {

        Toast.makeText(context, "CALL EVENT RECEIVED", Toast.LENGTH_SHORT).show()
        Log.d("CRM_CALL", "Broadcast received")

        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val incomingNumber =
            intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: ""

        Log.d("CRM_CALL", "Call state = $stateStr")

        val prefs = context.getSharedPreferences("call_state", Context.MODE_PRIVATE)

        when (stateStr) {

            /* ---------------- RINGING ---------------- */
            TelephonyManager.EXTRA_STATE_RINGING -> {
                savedNumber = incomingNumber
                Log.d("CRM_CALL", "RINGING from $savedNumber")
            }

            /* ---------------- OFFHOOK ---------------- */
            TelephonyManager.EXTRA_STATE_OFFHOOK -> {

                if (!prefs.getBoolean("call_active", false)) {
                    prefs.edit()
                        .putBoolean("call_active", true)
                        .putLong("call_start", System.currentTimeMillis())
                        .apply()

                    callStartTime = prefs.getLong("call_start", System.currentTimeMillis())
                }

                if (savedNumber.isEmpty()) {
                    savedNumber = incomingNumber.ifEmpty { "Unknown" }
                }

                // 🔐 PERSISTENT GUARD (FINAL)
                if (!prefs.getBoolean("recording_started", false)) {

                    prefs.edit().putBoolean("recording_started", true).apply()

                    Log.d("CRM_CALL", "OFFHOOK - starting recording")

                    val startIntent =
                        Intent(context, CallRecordingService::class.java).apply {
                            putExtra("action", "start")
                            putExtra("number", savedNumber)
                            putExtra("time", callStartTime.toString())
                        }

                    ContextCompat.startForegroundService(context, startIntent)

                } else {
                    Log.d("CRM_CALL", "OFFHOOK ignored - recording already started")
                }
            }

            /* ---------------- IDLE ---------------- */
            TelephonyManager.EXTRA_STATE_IDLE -> {

                if (!prefs.getBoolean("call_active", false)) return

                Log.d("CRM_CALL", "IDLE - call ended")

                context.startService(
                    Intent(context, CallRecordingService::class.java)
                        .putExtra("action", "stop")
                )

                Handler(Looper.getMainLooper()).postDelayed({
                    uploadLastRecordedCall(context)
                }, 800)

                // 🔁 CLEAR PERSISTENT STATE
                prefs.edit().clear().apply()
                savedNumber = ""
            }
        }
    }

    /* ---------------- AUTO UPLOAD ---------------- */

    private fun uploadLastRecordedCall(context: Context) {

        Log.d("CRM_UPLOAD", "uploadLastRecordedCall() triggered")

        val session = SessionManager(context)
        if (!session.isLoggedIn()) {
            Log.d("CRM_UPLOAD", "User not logged in, upload skipped")
            return
        }

        val prefs = context.getSharedPreferences("call_rec", Context.MODE_PRIVATE)
        val filePath = prefs.getString("last_file_path", "") ?: ""

        if (filePath.isEmpty()) {
            Log.d("CRM_UPLOAD", "No recording file path saved")
            return
        }

        val file = File(filePath)
        if (!file.exists()) {
            Log.d("CRM_UPLOAD", "Recording file does not exist")
            return
        }

        // 🔑 REQUIRED VALUES
        val phone = if (savedNumber.isNotEmpty()) savedNumber else "UNKNOWN"
        val endMs = System.currentTimeMillis()
        val durationSeconds = ((endMs - callStartTime) / 1000).toInt()
        val employeeId = session.getEmployeeId() // MUST exist in SessionManager
        val audioFileName = file.name

        Log.d(
            "CRM_UPLOAD",
            "Uploading call employee=$employeeId phone=$phone duration=$durationSeconds"
        )

        CallUploadWorker.enqueue(
            context = context,
            fileUri = android.net.Uri.fromFile(file),
            metadataJson = """
            {
              "employee_id": "$employeeId",
              "phone_number": "$phone",
              "call_type": "outgoing",
              "start_ms": $callStartTime,
              "end_ms": $endMs,
              "duration_seconds": $durationSeconds,
              "audio_file": "$audioFileName"
            }
        """.trimIndent()
        )
    }
}