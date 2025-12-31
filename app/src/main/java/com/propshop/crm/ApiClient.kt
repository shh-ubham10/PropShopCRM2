package com.propshop.crm

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

object ApiClient {

    private const val BASE_URL = "https://your-propshop-crm.com/api/call/report"

    fun sendCallData(payload: JSONObject) {
        try {
            val client = OkHttpClient()

            val body = payload.toString()
                .toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url(BASE_URL)
                .post(body)
                .build()

            client.newCall(request).enqueue(object : okhttp3.Callback {
                override fun onFailure(call: okhttp3.Call, e: java.io.IOException) {
                    e.printStackTrace()
                }

                override fun onResponse(
                    call: okhttp3.Call,
                    response: okhttp3.Response
                ) {
                    response.close()
                }
            })

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
