package com.propshop.crm

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    userRole: String,
    onLogout: () -> Unit
) {
    val context = LocalContext.current

    /* ---------------- REQUIRED PERMISSIONS ---------------- */
    val requiredPermissions = remember {
        mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_PHONE_STATE
        ).apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                add(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            }
        }
    }

    var permissionsGranted by remember { mutableStateOf(false) }
    var showPermissionDialog by remember { mutableStateOf(false) }
    var refreshTrigger by remember { mutableStateOf(0) }
    var todayCalls by remember { mutableStateOf<Int?>(null) }

    val permissionLauncher =
        rememberLauncherForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) {
            refreshTrigger++
        }

    /* ---------------- MAIN LOGIC ---------------- */
    LaunchedEffect(refreshTrigger) {

        permissionsGranted = checkPermissions(context, requiredPermissions)

        if (userRole != "admin") {

            if (permissionsGranted) {

                showPermissionDialog = false
                startLocationService(context)

                // ✅ CORRECT API ACCESS
                val api = AuthApiClient.api

                api.getTodayCalls().enqueue(object : retrofit2.Callback<TodayCallResponse> {

                    override fun onResponse(
                        call: retrofit2.Call<TodayCallResponse>,
                        response: retrofit2.Response<TodayCallResponse>
                    ) {
                        todayCalls =
                            if (response.isSuccessful)
                                response.body()?.todayCalls ?: 0
                            else
                                0
                    }

                    override fun onFailure(
                        call: retrofit2.Call<TodayCallResponse>,
                        t: Throwable
                    ) {
                        todayCalls = 0
                    }
                })

            } else {
                showPermissionDialog = true
                todayCalls = null
            }
        }
    }


    /* ---------------- PERMISSION POPUP ---------------- */
    if (showPermissionDialog && userRole != "admin") {
        AlertDialog(
            onDismissRequest = {},
            confirmButton = {
                Button(onClick = {
                    openAppSettings(context)
                    refreshTrigger++
                }) {
                    Text("Open Settings")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    permissionLauncher.launch(requiredPermissions.toTypedArray())
                }) {
                    Text("Grant Now")
                }
            },
            title = { Text("Permissions Required") },
            text = {
                Text(
                    "PropShop CRM requires location, call recording and background permissions.\n\nPlease enable ALL permissions to continue."
                )
            }
        )
    }

    /* ---------------- UI ---------------- */
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
                }
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp)
                .fillMaxSize()
        ) {

            /* ---------- LOGO ---------- */
            Image(
                painter = painterResource(id = R.drawable.propshop_logo),
                contentDescription = "PropShop Logo",
                modifier = Modifier
                    .height(70.dp)
                    .align(Alignment.CenterHorizontally)
            )

            Spacer(Modifier.height(16.dp))

            /* ---------- HEADER ---------- */
            Text(
                text = if (userRole == "admin")
                    "👑 Admin Dashboard"
                else
                    "👷 Employee Dashboard",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            /* ---------- PERMISSION STATUS ---------- */
            PermissionCard(
                title = "Permission Status",
                isOk = permissionsGranted,
                subtitle = if (permissionsGranted)
                    "All mandatory permissions enabled"
                else
                    "Permissions missing – tracking disabled"
            )

            Spacer(Modifier.height(16.dp))

            /* ---------- EMPLOYEE VIEW ---------- */
            if (userRole != "admin") {

                StatusCard("📍 Location Tracking", permissionsGranted)
                StatusCard("🎙 Call Recording", permissionsGranted)
                StatusCard("⏱ Background Service", permissionsGranted)

                Spacer(Modifier.height(16.dp))

                InfoCard(
                    title = "Today's Calls",
                    value = todayCalls?.let { "$it Calls" } ?: "Loading...",
                    color = if (permissionsGranted)
                        Color(0xFFDCFCE7)
                    else
                        Color(0xFFFEE2E2)
                )

            } else {

                InfoCard(
                    title = "Admin Access",
                    value = "Use Web CRM for reports & live tracking",
                    color = Color(0xFFEFF6FF)
                )
            }
        }
    }
}

/* ================= COMPONENTS ================= */

@Composable
fun PermissionCard(title: String, isOk: Boolean, subtitle: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isOk) Color(0xFFDCFCE7) else Color(0xFFFEE2E2)
        )
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text(subtitle)
        }
    }
}

@Composable
fun StatusCard(title: String, ok: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (ok) Color(0xFFECFDF5) else Color(0xFFFFF1F2)
        )
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(title)
            Text(if (ok) "ON" else "OFF", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun InfoCard(title: String, value: String, color: Color) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = color)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(value)
        }
    }
}

/* ================= HELPERS ================= */

private fun checkPermissions(context: Context, permissions: List<String>): Boolean =
    permissions.all {
        ActivityCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
    }

private fun openAppSettings(context: Context) {
    val intent = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.fromParts("package", context.packageName, null)
    )
    context.startActivity(intent)
}

private fun startLocationService(context: Context) {
    val intent = Intent(context, ForegroundLocationService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
    } else {
        context.startService(intent)
    }
}

private fun stopLocationService(context: Context) {
    val intent = Intent(context, ForegroundLocationService::class.java)
    context.stopService(intent)
}
