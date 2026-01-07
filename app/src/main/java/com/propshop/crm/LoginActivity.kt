package com.propshop.crm

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            LoginScreen { token, role, employeeId ->

                // ✅ SAVE LOGIN PROPERLY
                SessionManager(this).saveLogin(
                    token = token,
                    role = role,
                    employeeId = employeeId
                )

                startActivity(
                    Intent(this, MainActivity::class.java)
                )
                finish()
            }
        }
    }
}
