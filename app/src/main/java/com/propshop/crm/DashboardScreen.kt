package com.propshop.crm

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import android.content.Context

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    userRole: String,
    onLogout: () -> Unit
) {
    val context = LocalContext.current

    // 🔐 Permissions ONLY for employee silent tracking
    val requiredPermissions = remember {
        mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ).apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                add(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            }
        }
    }

    val permissionLauncher =
        rememberLauncherForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { }

    // 🟢 SILENT LOCATION TRACKING (EMPLOYEE ONLY)
    LaunchedEffect(Unit) {
        if (userRole != "admin") {

            val granted = requiredPermissions.all {
                ActivityCompat.checkSelfPermission(
                    context,
                    it
                ) == PackageManager.PERMISSION_GRANTED
            }

            if (granted) {
                val intent = Intent(context, ForegroundLocationService::class.java)
                context.startForegroundService(intent)
            } else {
                permissionLauncher.launch(
                    requiredPermissions.toTypedArray()
                )
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PropShop CRM") },
                actions = {
                    TextButton(onClick = {
                        stopLocationService(context)
                        onLogout()
                    }) {
                        Text("Logout")
                    }
                })
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(20.dp)
                .fillMaxSize()
        ) {

            if (userRole == "admin") {

                // 👑 ADMIN DASHBOARD
                Text(
                    text = "👑 Admin Dashboard",
                    style = MaterialTheme.typography.headlineMedium
                )

                Spacer(Modifier.height(20.dp))

                Text("• Employees")
                Text("• Reports")
                Text("• Live Tracking (Web CRM)")
                Text("• System Settings")

            } else {

                // 👷 EMPLOYEE DASHBOARD
                Text(
                    text = "👷 Employee Dashboard",
                    style = MaterialTheme.typography.headlineMedium
                )

                Spacer(Modifier.height(20.dp))

                Text("• My Calls")
                Text("• Upload Call Records")
                Text("• My Performance")
            }
        }
    }
}
private fun stopLocationService(context: Context) {
    val intent = Intent(context, ForegroundLocationService::class.java)
    context.stopService(intent)
}

