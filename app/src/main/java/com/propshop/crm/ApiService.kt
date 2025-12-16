package com.propshop.crm.network

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface ApiService {

    @Multipart
    @POST("upload-call")
    fun uploadCall(
        @Part audioFile: MultipartBody.Part,
        @Part("number") number: RequestBody,
        @Part("callTime") callTime: RequestBody,
        @Part("duration") duration: RequestBody
    ): Call<UploadResponse>
}
