package com.propshop.crm

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.work.*
import retrofit2.HttpException
import java.util.concurrent.TimeUnit

class CallUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {

        val fileUriStr = inputData.getString("fileUri")
        val metadata = inputData.getString("metadata")

        if (fileUriStr.isNullOrEmpty() || metadata.isNullOrEmpty()) {
            Log.e("CRM_UPLOAD", "Invalid input data")
            return Result.failure()
        }

        val fileUri = Uri.parse(fileUriStr)

        Log.d("CRM_UPLOAD", "Worker started")
        Log.d("CRM_UPLOAD", "FileUri = $fileUri")
        Log.d("CRM_UPLOAD", "Metadata = $metadata")

        // Ensure retrofit + auth ready
        AuthApiClient.init(applicationContext)

        return try {

            val response = CallUploadManager.uploadCall(
                context = applicationContext,
                fileUri = fileUri,
                metadataJson = metadata
            )

            Log.d("CRM_UPLOAD", "Upload success: $response")

            Result.success()

        } catch (e: HttpException) {

            Log.e(
                "CRM_UPLOAD",
                "HTTP error ${e.code()} : ${e.response()?.errorBody()?.string()}",
                e
            )

            // Retry only for server/network errors
            if (e.code() >= 500) Result.retry() else Result.failure()

        } catch (e: Exception) {

            Log.e("CRM_UPLOAD", "Upload failed", e)
            Result.retry()
        }
    }

    companion object {

        fun enqueue(
            context: Context,
            fileUri: Uri,
            metadataJson: String
        ) {

            val data = workDataOf(
                "fileUri" to fileUri.toString(),
                "metadata" to metadataJson
            )

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<CallUploadWorker>()
                .setInputData(data)
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    30,
                    TimeUnit.SECONDS
                )
                .addTag("CALL_UPLOAD")
                .build()

            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
