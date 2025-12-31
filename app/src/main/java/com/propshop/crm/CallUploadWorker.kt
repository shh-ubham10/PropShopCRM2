package com.propshop.crm

import android.content.Context
import android.net.Uri
import androidx.work.*
import java.util.concurrent.TimeUnit

class CallUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {

        val fileUri = inputData.getString("fileUri") ?: return Result.failure()
        val metadata = inputData.getString("metadata") ?: return Result.failure()

        return try {
            CallUploadManager.uploadCall(
                context = applicationContext,
                fileUri = Uri.parse(fileUri),
                metadataJson = metadata
            )
            Result.success()
        } catch (e: Exception) {
            Result.retry() // 🔁 auto retry
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
                .build()

            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
