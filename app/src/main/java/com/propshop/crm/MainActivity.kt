package com.propshop.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import com.propshop.crm.ui.theme.PropShopCRMTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // ✅ Init token interceptor ONCE
        AuthApiClient.init(this)

        setContent {

            val session = remember { SessionManager(this) }

            PropShopCRMTheme {

                // 🔐 AUTH DECISION ONLY
                if (!session.isLoggedIn()) {

                    LoginScreen { token, userId ->
                        session.saveLogin(token, userId)
                    }

                } else {

                    DashboardScreen(
                        userRole = "employee", // later from API
                        onLogout = {
                            session.logout()
                        }
                    )
                }
            }
        }
    }
}
