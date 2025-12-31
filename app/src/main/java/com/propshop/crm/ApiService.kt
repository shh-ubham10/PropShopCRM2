package com.propshop.crm

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface ApiService {

    // 🔐 LOGIN
    @POST("api/login")
    fun login(
        @Body body: LoginRequest
    ): Call<LoginResponse>

    // 📞 CALL UPLOAD (EMPLOYEE → CRM)
    @Multipart
    @POST("api/upload")
    fun uploadCall(
        @Part file: MultipartBody.Part,
        @Part("metadata") metadata: RequestBody
    ): Call<Unit>
}
