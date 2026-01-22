package com.propshop.crm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.telephony.TelephonyManager
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CallReceiver : BroadcastReceiver() {

    private var savedNumber: String = ""

    override fun onReceive(context: Context, intent: Intent) {

        Toast.makeText(context, "CALL EVENT RECEIVED", Toast.LENGTH_SHORT).show()
        Log.d("CRM_CALL", "Broadcast received")

        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val incomingNumber =
            intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: ""

        val statePrefs = context.getSharedPreferences("call_state", Context.MODE_PRIVATE)
        val recPrefs = context.getSharedPreferences("call_rec", Context.MODE_PRIVATE)

        Log.d("CRM_CALL", "Call state = $stateStr")

        when (stateStr) {

            /* ---------------- RINGING ---------------- */
            TelephonyManager.EXTRA_STATE_RINGING -> {
                savedNumber = incomingNumber
                Log.d("CRM_CALL", "RINGING from $savedNumber")
            }

            /* ---------------- OFFHOOK ---------------- */
            TelephonyManager.EXTRA_STATE_OFFHOOK -> {

                if (!statePrefs.getBoolean("call_active", false)) {

                    val startTime = System.currentTimeMillis()

                    statePrefs.edit()
                        .putBoolean("call_active", true)
                        .putBoolean("recording_started", false)
                        .apply()

                    recPrefs.edit()
                        .putLong("call_start_time", startTime)
                        .apply()

                    Log.d("CRM_CALL", "Call start time saved = $startTime")
                }

                if (savedNumber.isEmpty()) {
                    savedNumber = incomingNumber.ifEmpty { "UNKNOWN" }
                }

                if (!statePrefs.getBoolean("recording_started", false)) {

                    statePrefs.edit()
                        .putBoolean("recording_started", true)
                        .apply()

                    Log.d("CRM_CALL", "OFFHOOK - starting recording")

                    val startIntent =
                        Intent(context, CallRecordingService::class.java).apply {
                            putExtra("action", "start")
                            putExtra("number", savedNumber)
                        }

                    ContextCompat.startForegroundService(context, startIntent)
                }
            }

            /* ---------------- IDLE ---------------- */
            TelephonyManager.EXTRA_STATE_IDLE -> {

                if (!statePrefs.getBoolean("call_active", false)) return

                Log.d("CRM_CALL", "IDLE - call ended")

                // Stop recording
                context.startService(
                    Intent(context, CallRecordingService::class.java)
                        .putExtra("action", "stop")
                )

                // Upload after short delay
                Handler(Looper.getMainLooper()).postDelayed({
                    uploadLastRecordedCall(context)
                }, 800)

                // Clear state
                statePrefs.edit().clear().apply()
                savedNumber = ""
            }
        }
    }

    /* ================= CALL UPLOAD ================= */

    private fun uploadLastRecordedCall(context: Context) {

        Log.d("CRM_UPLOAD", "uploadLastRecordedCall() triggered")

        val session = SessionManager(context)
        if (!session.isLoggedIn()) return

        val recPrefs = context.getSharedPreferences("call_rec", Context.MODE_PRIVATE)
        val filePath = recPrefs.getString("last_file_path", "") ?: return

        val file = File(filePath)
        if (!file.exists()) return

        val startMs = recPrefs.getLong("call_start_time", 0L)
        val endMs = System.currentTimeMillis()

        val actualStart = if (startMs > 0) startMs else endMs
        val durationSeconds = ((endMs - actualStart) / 1000).coerceAtLeast(1)

        val phone = if (savedNumber.isNotEmpty()) savedNumber else "UNKNOWN"
        val employeeId = session.getEmployeeId()

        // 🔥 GET LOCATION AND EMBED INTO METADATA
        LocationHelper.getCurrentLocation(context) { location ->

            val metadataJson = JSONObject().apply {
                put("employee_id", employeeId)
                put("phone_number", phone)
                put("call_type", "outgoing")
                put("start_ms", actualStart)
                put("end_ms", endMs)
                put("duration_seconds", durationSeconds)
                put("audio_file", file.name)

                if (location != null) {
                    put(
                        "location",
                        JSONObject().apply {
                            put("latitude", location.latitude)
                            put("longitude", location.longitude)
                            put("timestamp", getIsoTime())
                        }
                    )
                }
            }.toString()

            CallUploadWorker.enqueue(
                context = context,
                fileUri = Uri.fromFile(file),
                metadataJson = metadataJson
            )
        }
    }

    private fun getIsoTime(): String {
        return SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss",
            Locale.getDefault()
        ).format(Date())
    }
}
