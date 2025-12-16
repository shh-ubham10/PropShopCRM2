package com.propshop.crm

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationManager

object GPSManager {

    /**
     * Returns Pair<lat,lng> or null if not available.
     * Requires ACCESS_FINE_LOCATION runtime permission granted.
     */
    @SuppressLint("MissingPermission")
    fun getLastKnownLocation(context: Context): Pair<Double, Double>? {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        val providers = lm.getProviders(true)
        var best: Location? = null

        for (p in providers) {
            val l = lm.getLastKnownLocation(p) ?: continue
            if (best == null || l.accuracy < best.accuracy) {
                best = l
            }
        }

        return best?.let { Pair(it.latitude, it.longitude) }
    }
}
