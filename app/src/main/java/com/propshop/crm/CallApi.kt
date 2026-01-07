package com.propshop.crm

import retrofit2.Call
import retrofit2.http.GET

interface CallApi {

    @GET("api/today-calls")
    fun getTodayCalls(): Call<TodayCallResponse>
}
