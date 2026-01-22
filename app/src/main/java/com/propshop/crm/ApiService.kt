package com.propshop.crm

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Query

/* ================= API SERVICE ================= */

interface ApiService {

    // 🔐 LOGIN
    @POST("api/login")
    fun login(
        @Body body: LoginRequest
    ): Call<LoginResponse>

    // 🆕 REGISTER
    @POST("api/register")
    fun register(
        @Body body: RegisterPayload
    ): Call<RegisterResponse>

    // 📊 TODAY CALL COUNT
    @GET("api/today-calls")
    fun getTodayCalls(
        @Query("employee_id") employeeId: String,
        @Query("date") date: String
    ): Call<TodayCallResponse>


    // 📞 CALL UPLOAD
    @Multipart
    @POST("api/upload")
    fun uploadCall(
        @Part audio: MultipartBody.Part,
        @Part("metadata") metadata: RequestBody
    ): Call<Unit>
}



