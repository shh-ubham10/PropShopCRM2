package com.propshop.crm

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import com.propshop.crm.ui.theme.PropShopCRMTheme



class MainActivity : ComponentActivity() {

    private val requiredPermissions = mutableListOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,      // Required to detect numbers in Android 10+
        Manifest.permission.READ_PHONE_NUMBERS  // Required for outgoing calls on Android 12+
    ).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            add(Manifest.permission.POST_NOTIFICATIONS)
            add(Manifest.permission.READ_MEDIA_AUDIO)
        } else {
            add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
    }

    // Launcher for permissions
    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
            // Nothing special needed here
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        askPermissions()

        setContent {
            var granted by remember { mutableStateOf(allPermissionsGranted()) }

            PropShopCRMTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { padding ->
                    Column(
                        modifier = Modifier
                            .padding(padding)
                            .fillMaxSize()
                            .padding(20.dp)
                    ) {
                        Text(
                            text = if (granted)
                                "📞 Call Recording Ready"
                            else
                                "❗ Permissions Missing",
                            style = MaterialTheme.typography.headlineMedium
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        Button(
                            onClick = {
                                askPermissions()
                                granted = allPermissionsGranted()
                            }
                        ) {
                            Text("Request Permissions Again")
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Text("The app will automatically record calls in background.",
                            style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
        }
    }

    private fun askPermissions() {
        val toRequest = requiredPermissions.filter {
            ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (toRequest.isNotEmpty()) {
            permissionLauncher.launch(toRequest.toTypedArray())
        }
    }

    private fun allPermissionsGranted(): Boolean {
        return requiredPermissions.all {
            ActivityCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    PropShopCRMTheme { }
}
