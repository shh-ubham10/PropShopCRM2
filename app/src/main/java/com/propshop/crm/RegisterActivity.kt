package com.propshop.crm

import android.content.Intent
import com.propshop.crm.RegisterUser
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import com.propshop.crm.RegisterPayload
import com.propshop.crm.RegisterResponse


class RegisterActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        AuthApiClient.init(this) // ✅ FIX

        setContent {
            RegisterScreen(
                onRegisterSuccess = { token, user ->

                    SessionManager(this).saveLogin(
                        token = token,
                        userId = user.id.toString(),
                        username = user.username,
                        phoneNumber = "",
                        role = user.role
                    )

                    val intent = Intent(this, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                }
            )
        }
    }
}


@Composable
fun RegisterScreen(
    onRegisterSuccess: (String, RegisterUser) -> Unit
) {
    val context = LocalContext.current

    var username by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = "Register New User",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = phoneNumber,
            onValueChange = { phoneNumber = it },
            label = { Text("Mobile Number") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Phone
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading,
            onClick = {

                when {
                    username.isBlank() ||
                            phoneNumber.isBlank() ||
                            password.isBlank() ||
                            confirmPassword.isBlank() -> {
                        context.toast("All fields are required")
                        return@Button
                    }

                    phoneNumber.length < 8 -> {
                        context.toast("Enter valid mobile number")
                        return@Button
                    }

                    password != confirmPassword -> {
                        context.toast("Passwords do not match")
                        return@Button
                    }
                }

                loading = true

                val payload = RegisterPayload(
                    username = username,
                    password = password,
                    phone_number = phoneNumber,
                    role = "employee"
                )

                AuthApiClient.api
                    .register(payload)
                    .enqueue(object : Callback<RegisterResponse> {

                        override fun onResponse(
                            call: Call<RegisterResponse>,
                            response: Response<RegisterResponse>
                        ) {
                            loading = false

                            if (response.isSuccessful && response.body() != null) {
                                val res = response.body()!!
                                onRegisterSuccess(res.token, res.user)
                            } else {
                                context.toast("Registration failed")
                            }
                        }

                        override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                            loading = false
                            context.toast("Network error")
                        }
                    })
            }
        ) {
            Text(if (loading) "Registering..." else "Register")
        }
    }
}

