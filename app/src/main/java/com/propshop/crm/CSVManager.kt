package com.propshop.crm

import android.content.Context
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

object CSVManager {

    private val dateFmt = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    /**
     * Appends a single call record row to filesDir/call_logs/calls.csv
     *
     * Columns:
     * employeeId,phoneNumber,callType,startTime,endTime,durationSeconds,gpsLat,gpsLng,recordingPath
     */
    fun appendCall(
        context: Context,
        employeeId: String?,
        phoneNumber: String?,
        callType: String,
        startMs: Long,
        endMs: Long,
        gpsLat: Double?,
        gpsLng: Double?,
        recordingPath: String
    ) {
        val folder = File(context.filesDir, "call_logs")
        if (!folder.exists()) folder.mkdirs()

        val csv = File(folder, "calls.csv")
        if (!csv.exists()) {
            csv.appendText("employeeId,phoneNumber,callType,startTime,endTime,durationSeconds,gpsLat,gpsLng,recordingPath\n")
        }

        val start = dateFmt.format(Date(startMs))
        val end = dateFmt.format(Date(endMs))
        val duration = ((endMs - startMs) / 1000).toString()

        val latStr = gpsLat?.toString() ?: ""
        val lngStr = gpsLng?.toString() ?: ""

        val line = listOf(
            employeeId ?: "",
            phoneNumber ?: "",
            callType,
            start,
            end,
            duration,
            latStr,
            lngStr,
            recordingPath
        ).joinToString(",") + "\n"

        csv.appendText(line)
    }
}
