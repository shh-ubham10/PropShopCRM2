package com.propshop.crm

import android.content.Context

class SessionManager(context: Context) {

    private val prefs =
        context.getSharedPreferences("propshop_crm", Context.MODE_PRIVATE)

    fun saveLogin(token: String, userId: Int) {
        prefs.edit()
            .putString("TOKEN", token)
            .putInt("USER_ID", userId)
            .apply()
    }

    fun isLoggedIn(): Boolean {
        return prefs.getString("TOKEN", null) != null
    }
    fun getUserId(): Int {
        return prefs.getInt("USER_ID", -1)
    }

    fun getToken(): String? = prefs.getString("TOKEN", null)

    fun logout() {
        prefs.edit().clear().apply()
    }
}

