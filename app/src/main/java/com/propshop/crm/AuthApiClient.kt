package com.propshop.crm

import android.content.Context
import android.util.Log
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object AuthApiClient {

    const val BASE_URL = "https://record-call.onrender.com/"

    @Volatile
    private var retrofit: Retrofit? = null

    fun init(context: Context) {
        if (retrofit != null) return // ✅ prevents re-init

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(context))
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        Log.d("AUTH", "Retrofit initialized")
    }

    val api: ApiService
        get() {
            checkNotNull(retrofit) {
                "AuthApiClient.init(context) must be called before using api"
            }
            return retrofit!!.create(ApiService::class.java)
        }
}

