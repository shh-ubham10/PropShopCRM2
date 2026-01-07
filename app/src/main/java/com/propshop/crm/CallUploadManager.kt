package com.propshop.crm

import android.content.Context
import android.net.Uri
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.HttpException

object CallUploadManager {

    @Throws(Exception::class)
    fun uploadCall(
        context: Context,
        fileUri: Uri,
        metadataJson: String
    ) {

        val inputStream = context.contentResolver.openInputStream(fileUri)
            ?: throw Exception("Audio file not found")

        val fileBytes = inputStream.readBytes()

        val requestFile = RequestBody.create(
            "audio/*".toMediaTypeOrNull(),
            fileBytes
        )

        val filePart = MultipartBody.Part.createFormData(
            "file",
            "call_recording.mp3",
            requestFile
        )

        val metadata = RequestBody.create(
            "application/json".toMediaTypeOrNull(),
            metadataJson
        )

        // 🔴 BLOCKING CALL — THIS IS THE FIX
        val response = AuthApiClient.api
            .uploadCall(filePart, metadata)
            .execute()

        if (!response.isSuccessful) {
            throw HttpException(response)
        }
    }
}
