package com.propshop.crm

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class LoginActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            LoginScreen(
                onLoginSuccess = { token, user ->

                    SessionManager(this).saveLogin(
                        token = token,
                        userId = user.id.toString(),
                        username = "",        // backend doesn't send it
                        phoneNumber = "",     // backend doesn't send it
                        role = user.role
                    )

                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                },

                        onRegisterClick = {
                    startActivity(
                        Intent(this, RegisterActivity::class.java)
                    )
                },

                // ✅ THIS WAS MISSING
                onForgotPasswordClick = {
                    startActivity(
                        Intent(this, ForgotPasswordActivity::class.java)
                    )
                }
            )
        }
    }
}
