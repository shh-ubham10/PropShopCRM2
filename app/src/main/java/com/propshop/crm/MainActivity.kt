package com.propshop.crm

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import com.propshop.crm.ui.theme.PropShopCRMTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        Log.d("MAIN", "MainActivity started")

        // ✅ Init Retrofit + Auth Interceptor ONCE
        AuthApiClient.init(this)

        setContent {

            val session = remember { SessionManager(this) }
            var isLoggedIn by remember {
                mutableStateOf(session.isLoggedIn())
            }

            PropShopCRMTheme {

                if (!isLoggedIn) {

                    Log.d("MAIN", "User NOT logged in → showing LoginScreen")

                    LoginScreen(
                        onLoginSuccess = { token, user ->

                            Log.d(
                                "LOGIN",
                                "Login success | role=${user.role} | employeeId=${user.id}"
                            )

                            session.saveLogin(
                                token = token,
                                userId = user.id.toString(),
                                username = "",
                                phoneNumber = "",
                                role = user.role
                            )

                            isLoggedIn = true
                        },
                        onRegisterClick = {

                            Log.d("MAIN", "Navigate to RegisterActivity")

                            startActivity(
                                Intent(this, RegisterActivity::class.java)
                            )
                        },
                        onForgotPasswordClick = {
                            Log.d("MAIN", "Forgot password clicked (disabled)")
                        }
                    )


                } else {

                    Log.d("MAIN", "User logged in → showing Dashboard")

                    DashboardScreen(
                        userRole = session.getRole(),
                        onLogout = {

                            Log.d("MAIN", "User logged out")

                            session.logout()
                            isLoggedIn = false
                        }
                    )
                }
            }
        }
    }
}
