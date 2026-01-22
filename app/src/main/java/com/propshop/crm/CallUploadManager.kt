package com.propshop.crm

import android.content.Context
import android.net.Uri
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import retrofit2.HttpException
import java.io.File
import java.io.FileOutputStream

object CallUploadManager {

    @Throws(Exception::class)
    fun uploadCall(
        context: Context,
        fileUri: Uri,
        metadataJson: String
    ) {

        val inputStream = context.contentResolver.openInputStream(fileUri)
            ?: throw Exception("Audio file not found")

        val tempFile = File.createTempFile(
            "call_upload_",
            ".m4a",
            context.cacheDir
        )

        FileOutputStream(tempFile).use { output ->
            inputStream.use { input ->
                input.copyTo(output)
            }
        }

        // ✅ FIXED: File → asRequestBody
        val audioRequestBody = tempFile
            .asRequestBody("audio/m4a".toMediaType())

        val audioPart = MultipartBody.Part.createFormData(
            name = "audio_file",
            filename = tempFile.name,
            body = audioRequestBody
        )

        // ✅ String → toRequestBody
        val metadataPart = metadataJson
            .toRequestBody("application/json".toMediaType())

//        Log.d("CRM_UPLOAD", "Metadata = $metadataPart")
        Log.d("CRM_UPLOAD", "Metadata JSON = $metadataJson")

        val response = AuthApiClient.api
            .uploadCall(audioPart, metadataPart)
            .execute()

        if (!response.isSuccessful) {
            throw HttpException(response)
        }
    }
}

