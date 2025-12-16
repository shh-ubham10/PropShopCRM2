package com.propshop.crm.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    private const val BASE_URL = "http://YOUR_LOCAL_IP:192.168.0.181/"
    // Change YOUR_LOCAL_IP → Example 192.168.1.5

    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
