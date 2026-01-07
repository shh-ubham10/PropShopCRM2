package com.propshop.crm

import android.content.Context

class SessionManager(context: Context) {

    private val prefs =
        context.getSharedPreferences("propshop_crm", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "TOKEN"
        private const val KEY_ROLE = "ROLE"
        private const val KEY_EMPLOYEE_ID = "EMPLOYEE_ID"
    }

    fun saveLogin(token: String, role: String, employeeId: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, role)
            .putString(KEY_EMPLOYEE_ID, employeeId)
            .apply()
    }

    fun getToken(): String? =
        prefs.getString(KEY_TOKEN, null)

    fun getRole(): String =
        prefs.getString(KEY_ROLE, "") ?: ""

    fun getEmployeeId(): String =
        prefs.getString(KEY_EMPLOYEE_ID, "") ?: ""

    fun isLoggedIn(): Boolean =
        getToken() != null

    fun logout() {
        prefs.edit().clear().apply()
    }
}

