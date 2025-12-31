package com.propshop.crm.network

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

data class LocationPayload(
    val employeeId: String,
    val lat: Double?,
    val lng: Double?,
    val permissionOk: Boolean,
    val timestamp: Long
)

interface LocationApiService {
    @POST("api/location/update")
    fun sendLocation(@Body payload: LocationPayload): Call<Unit>
}
