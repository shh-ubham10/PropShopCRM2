package com.propshop.crm

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.work.*
import retrofit2.HttpException
import java.util.concurrent.TimeUnit
import org.json.JSONObject

class CallUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {

        val fileUriStr = inputData.getString("fileUri")
        val metadataJson = inputData.getString("metadata")

        if (fileUriStr.isNullOrEmpty() || metadataJson.isNullOrEmpty()) {
            Log.e("CRM_UPLOAD", "❌ Invalid input data")
            return Result.failure()
        }

        val fileUri = Uri.parse(fileUriStr)

        // ✅ Validate metadata JSON (VERY IMPORTANT)
        try {
            JSONObject(metadataJson)
        } catch (e: Exception) {
            Log.e("CRM_UPLOAD", "❌ Metadata is not valid JSON", e)
            return Result.failure()
        }

        Log.d("CRM_UPLOAD", "🚀 Worker started")
        Log.d("CRM_UPLOAD", "📂 FileUri = $fileUri")
        Log.d("CRM_UPLOAD", "🧾 Metadata = $metadataJson")

        // Ensure retrofit + auth ready
        AuthApiClient.init(applicationContext)

        return try {

            val response = CallUploadManager.uploadCall(
                context = applicationContext,
                fileUri = fileUri,
                metadataJson = metadataJson
            )

            Log.d("CRM_UPLOAD", "✅ Upload success")

            Result.success()

        } catch (e: HttpException) {

            val errorBody = e.response()?.errorBody()?.string()

            Log.e(
                "CRM_UPLOAD",
                "❌ HTTP ${e.code()} : $errorBody",
                e
            )

            // Retry only for server issues
            if (e.code() >= 500) {
                Result.retry()
            } else {
                Result.failure()
            }

        } catch (e: Exception) {

            Log.e("CRM_UPLOAD", "❌ Upload failed (network / IO)", e)
            Result.retry()
        }
    }

    companion object {

        fun enqueue(
            context: Context,
            fileUri: Uri,
            metadataJson: String
        ) {

            // ✅ Validate JSON before enqueue
            try {
                JSONObject(metadataJson)
            } catch (e: Exception) {
                Log.e("CRM_UPLOAD", "❌ Invalid metadata JSON – not enqueued", e)
                return
            }

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

            WorkManager
                .getInstance(context)
                .enqueue(request)

            Log.d("CRM_UPLOAD", "📤 Upload job enqueued")
        }
    }
}
