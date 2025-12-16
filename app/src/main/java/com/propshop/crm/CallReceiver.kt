package com.propshop.crm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat

class CallReceiver : BroadcastReceiver() {

    private var lastState = TelephonyManager.CALL_STATE_IDLE
    private var startTime: Long = 0
    private var savedNumber: String = ""

    override fun onReceive(context: Context, intent: Intent) {

        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: ""

        when (stateStr) {

            TelephonyManager.EXTRA_STATE_RINGING -> {
                // Incoming call number
                savedNumber = incomingNumber
            }

            TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                // If incoming number is empty → outgoing call
                if (savedNumber.isEmpty()) {
                    savedNumber = incomingNumber.ifEmpty { "Unknown" }
                }

                startTime = System.currentTimeMillis()

                val serviceIntent = Intent(context, CallRecordingService::class.java).apply {
                    putExtra("action", "start")
                    putExtra("number", savedNumber)
                    putExtra("time", startTime.toString())
                }

                try {
                    ContextCompat.startForegroundService(context, serviceIntent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            TelephonyManager.EXTRA_STATE_IDLE -> {
                val serviceIntent = Intent(context, CallRecordingService::class.java).apply {
                    putExtra("action", "stop")
                }

                try {
                    ContextCompat.startForegroundService(context, serviceIntent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}
