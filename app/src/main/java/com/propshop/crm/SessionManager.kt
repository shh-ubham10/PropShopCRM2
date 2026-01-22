package com.propshop.crm

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("crm_session", Context.MODE_PRIVATE)

    /* ================= LOGIN ================= */

    fun saveLogin(
        token: String,
        userId: String,
        username: String,
        phoneNumber: String,
        role: String
    ) {
        prefs.edit()
            .putString("token", token)
            .putString("user_id", userId)
            .putString("username", username)
            .putString("phone_number", phoneNumber)
            .putString("role", role)
            .putBoolean("logged_in", true)
            .apply()
    }


    /* ================= GETTERS ================= */

    fun isLoggedIn(): Boolean {
        val token = prefs.getString("token", null)
        val userId = prefs.getString("userId", null)
        val role = prefs.getString("role", null)

        return !token.isNullOrBlank() &&
                !userId.isNullOrBlank() &&
                !role.isNullOrBlank()
    }

    fun getToken(): String =
        prefs.getString(KEY_TOKEN, "") ?: ""

    fun getEmployeeId(): String =
        prefs.getString(KEY_USER_ID, "") ?: ""

    fun getUsername(): String =
        prefs.getString(KEY_USERNAME, "") ?: ""

    fun getRole(): String =
        prefs.getString(KEY_ROLE, "employee") ?: "employee"

    fun getPhoneNumber(): String =
        prefs.getString(KEY_PHONE, "UNKNOWN") ?: "UNKNOWN"

    /* ================= LOGOUT ================= */

    fun logout() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_LOGGED_IN = "logged_in"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_ROLE = "role"
        private const val KEY_PHONE = "phone_number"
    }
}
