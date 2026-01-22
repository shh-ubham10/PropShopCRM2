package com.propshop.crm

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.os.Looper
import com.google.android.gms.location.*

object LocationHelper {

    private lateinit var client: FusedLocationProviderClient

    @SuppressLint("MissingPermission")
    fun getCurrentLocation(
        context: Context,
        callback: (Location?) -> Unit
    ) {
        client = LocationServices.getFusedLocationProviderClient(context)

        client.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    callback(location)
                } else {
                    requestSingleUpdate(context, callback)
                }
            }
            .addOnFailureListener {
                callback(null)
            }
    }

    @SuppressLint("MissingPermission")
    private fun requestSingleUpdate(
        context: Context,
        callback: (Location?) -> Unit
    ) {
        val request = LocationRequest.Builder(
            Priority.PRIORITY_BALANCED_POWER_ACCURACY,
            1000
        ).setMaxUpdates(1).build()

        val callbackLocation = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                callback(result.lastLocation)
                client.removeLocationUpdates(this)
            }
        }

        client.requestLocationUpdates(
            request,
            callbackLocation,
            Looper.getMainLooper()
        )
    }
}
