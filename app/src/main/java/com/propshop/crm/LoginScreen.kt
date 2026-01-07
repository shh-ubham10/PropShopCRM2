package com.propshop.crm

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (token: String, role: String, employeeId: String) -> Unit
) {
    val context = LocalContext.current

    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(horizontal = 24.dp)
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {

            // 🔵 LOGO
            Image(
                painter = painterResource(id = R.drawable.propshop_logo),
                contentDescription = "PropShop Logo",
                modifier = Modifier
                    .height(90.dp)
                    .padding(bottom = 16.dp)
            )

            Text(
                text = "Welcome to PropShop CRM",
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(modifier = Modifier.height(32.dp))

            // 👤 USERNAME
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            // 🔐 PASSWORD
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // 🔘 LOGIN BUTTON
            Button(
                enabled = !loading,
                onClick = {
                    if (username.isBlank() || password.isBlank()) {
                        Toast.makeText(
                            context,
                            "Enter username and password",
                            Toast.LENGTH_SHORT
                        ).show()
                        return@Button
                    }

                    loading = true

                    // 🔥 CALL LOGIN API
                    AuthApiClient.api.login(
                        LoginRequest(username, password)
                    ).enqueue(object : Callback<LoginResponse> {

                        override fun onResponse(
                            call: Call<LoginResponse>,
                            response: Response<LoginResponse>
                        ) {
                            loading = false

                            if (response.isSuccessful && response.body() != null) {

                                val body = response.body()!!

                                val token = body.token
                                val role = body.user.role
                                val employeeId = body.user.id.toString()

                                onLoginSuccess(token, role, employeeId)

                            } else {
                                Toast.makeText(
                                    context,
                                    "Invalid credentials",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        }

                        override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                            loading = false
                            Toast.makeText(
                                context,
                                "Login failed: ${t.message}",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    })
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(if (loading) "Logging in..." else "Login")
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "© PropShop Technologies",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
