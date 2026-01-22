package com.propshop.crm

import android.widget.Toast
import android.util.Log
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
import com.propshop.crm.UserDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (token: String, user: UserDto) -> Unit,
    onRegisterClick: () -> Unit,
    onForgotPasswordClick: () -> Unit
) {
    val context = LocalContext.current

    var identifier by remember { mutableStateOf("") }   // ✅ FIXED
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

            // 👤 USERNAME OR MOBILE
            OutlinedTextField(
                value = identifier,
                onValueChange = { identifier = it },
                label = { Text("Username or Mobile Number") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text
                ),
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

            // 🔁 FORGOT PASSWORD
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onForgotPasswordClick) {
                    Text("Forgot Password?")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 🔘 LOGIN BUTTON
            Button(
                enabled = !loading,
                onClick = {

                    Log.d("LOGIN_FLOW", "Login button clicked")

                    if (identifier.isBlank() || password.isBlank()) {
                        Toast.makeText(
                            context,
                            "Enter username/mobile and password",
                            Toast.LENGTH_SHORT
                        ).show()
                        return@Button
                    }

                    loading = true

                    Log.d("LOGIN_FLOW", "Calling login API with identifier=$identifier")


                    AuthApiClient.api.login(
                        LoginRequest(
                            identifier = identifier.trim(),
                            password = password
                        )
                    ).enqueue(object : Callback<LoginResponse> {

                        override fun onResponse(
                            call: Call<LoginResponse>,
                            response: Response<LoginResponse>
                        ) {
                            loading = false

                            Log.d("LOGIN_FLOW", "Response code: ${response.code()}")
                            Log.d("LOGIN_FLOW", "Response body: ${response.body()}")


                            if (response.isSuccessful && response.body() != null) {
                                val body = response.body()!!

                                onLoginSuccess(
                                    body.token,
                                    body.user
                                )


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
                            Log.e("LOGIN_FLOW", "Login API failed", t)
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

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(onClick = onRegisterClick) {
                Text("Register New User")
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "© PropShop Technologies",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
