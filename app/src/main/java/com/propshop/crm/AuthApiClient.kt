package com.propshop.crm

import android.content.Context
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object AuthApiClient {

    const val BASE_URL = "https://propshop-crm-backend.onrender.com/"


    // 🔒 Retrofit stays PRIVATE
    private lateinit var retrofit: Retrofit

    fun init(context: Context) {

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(context)) // injects token
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    // ✅ THIS is what UI should use
    val api: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}
