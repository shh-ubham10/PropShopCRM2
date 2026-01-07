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

            var isLoggedIn by remember {
                mutableStateOf(session.isLoggedIn())
            }

            PropShopCRMTheme {

                if (!isLoggedIn) {

                    // ✅ FIXED: accept 3 parameters
                    LoginScreen { token, role, employeeId ->

                        session.saveLogin(
                            token = token,
                            role = role,
                            employeeId = employeeId
                        )

                        isLoggedIn = true   // 🔄 trigger recomposition
                    }

                } else {

                    DashboardScreen(
                        userRole = session.getRole(),
                        onLogout = {
                            session.logout()
                            isLoggedIn = false  // 🔄 trigger recomposition
                        }
                    )
                }
            }
        }
    }
}
