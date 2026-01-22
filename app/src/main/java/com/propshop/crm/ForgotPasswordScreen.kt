package com.propshop.crm

import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

@Composable
fun ForgotPasswordScreen(
    onDone: () -> Unit
) {
    val context = LocalContext.current
    var phoneNumber by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = "Forgot Password",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Enter your registered mobile number",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = phoneNumber,
            onValueChange = { phoneNumber = it },
            label = { Text("Mobile Number") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Phone
            ),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading,
            onClick = {

                if (phoneNumber.isBlank() || phoneNumber.length < 8) {
                    Toast.makeText(
                        context,
                        "Enter valid mobile number",
                        Toast.LENGTH_SHORT
                    ).show()
                    return@Button
                }

                loading = true

                // ⏳ TEMP MOCK (backend later)
                Handler(Looper.getMainLooper()).postDelayed({

                    loading = false

                    Toast.makeText(
                        context,
                        "Password reset link sent (mock)",
                        Toast.LENGTH_LONG
                    ).show()

                    onDone()

                }, 1500)
            }
        ) {
            Text(if (loading) "Processing..." else "Reset Password")
        }
    }
}
