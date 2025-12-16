package com.propshop.crm

import android.util.Log
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

object UploadManager {
    // <-- change to your server URL (e.g. http://192.168.0.100:3000/upload)
    private const val BACKEND_UPLOAD_URL = "http://YOUR_SERVER_IP:3000/upload"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(5, TimeUnit.MINUTES)
        .readTimeout(2, TimeUnit.MINUTES)
        .build()

    fun uploadCall(
        employeeId: String?,
        phoneNumber: String?,
        callType: String,
        startMs: Long,
        endMs: Long,
        gpsLat: Double?,
        gpsLng: Double?,
        recordingFile: File,
        onComplete: (success: Boolean, responseBody: String?) -> Unit
    ) {
        try {
            val metadata = JSONObject().apply {
                put("employeeId", employeeId ?: "")
                put("phoneNumber", phoneNumber ?: "")
                put("callType", callType)
                put("startMs", startMs)
                put("endMs", endMs)
                put("gpsLat", gpsLat ?: JSONObject.NULL)
                put("gpsLng", gpsLng ?: JSONObject.NULL)
                put("fileName", recordingFile.name)
            }

            val fileBody = recordingFile.asRequestBody("audio/*".toMediaTypeOrNull())
            val multipart = MultipartBody.Builder().setType(MultipartBody.FORM)
                .addFormDataPart("metadata", metadata.toString())
                .addFormDataPart("file", recordingFile.name, fileBody)
                .build()

            val req = Request.Builder()
                .url(BACKEND_UPLOAD_URL)
                .post(multipart)
                .build()

            val resp = client.newCall(req).execute()
            val body = resp.body?.string()
            val success = resp.isSuccessful
            onComplete(success, body)
        } catch (e: Exception) {
            Log.e("UploadManager", "upload error: ${e.message}")
            onComplete(false, null)
        }
    }
}
