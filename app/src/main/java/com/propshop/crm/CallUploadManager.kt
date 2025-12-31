package com.propshop.crm

import android.content.Context
import android.net.Uri
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object CallUploadManager {

    fun uploadCall(
        context: Context,
        fileUri: Uri,
        metadataJson: String
    ) {

        val inputStream = context.contentResolver.openInputStream(fileUri)
            ?: return

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

        AuthApiClient.api.uploadCall(filePart, metadata)
            .enqueue(object : Callback<Unit> {

                override fun onResponse(
                    call: Call<Unit>,
                    response: Response<Unit>
                ) {
                    // success → backend has it
                }

                override fun onFailure(call: Call<Unit>, t: Throwable) {
                    // retry logic later
                }
            })
    }
}
