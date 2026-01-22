package com.propshop.crm

import android.content.Context
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val context: Context) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {

        val request = chain.request()

        val isPublicApi = request.url.encodedPath.contains("/login") ||
                request.url.encodedPath.contains("/register") ||
                request.url.encodedPath.contains("/forgot-password")

        if (isPublicApi) {
            return chain.proceed(request)
        }

        val token = SessionManager(context).getToken()

        val newRequest = request.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        return chain.proceed(newRequest)
    }
}

