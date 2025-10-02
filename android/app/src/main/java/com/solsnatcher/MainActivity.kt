package com.solsnatcher

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solsnatcher.ui.screens.DashboardScreen
import com.solsnatcher.ui.screens.SettingsScreen
import com.solsnatcher.ui.theme.SolSnatcherTheme
import com.solsnatcher.ui.viewmodel.MainViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // Permission granted, start floating widget
            startFloatingWidget()
        }
    }
    
    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (Settings.canDrawOverlays(this)) {
                startFloatingWidget()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            SolSnatcherTheme {
                val viewModel: MainViewModel = viewModel()
                val uiState by viewModel.uiState.collectAsState()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen(
                        uiState = uiState,
                        onStartFloatingWidget = { checkPermissionsAndStart() },
                        onNavigateToSettings = { viewModel.navigateToSettings() },
                        onNavigateToDashboard = { viewModel.navigateToDashboard() }
                    )
                }
            }
        }
    }
    
    private fun checkPermissionsAndStart() {
        // Check notification permission
        if (!NotificationManagerCompat.from(this).areNotificationsEnabled()) {
            requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            return
        }
        
        // Check overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
                overlayPermissionLauncher.launch(intent)
                return
            }
        }
        
        startFloatingWidget()
    }
    
    private fun startFloatingWidget() {
        val intent = Intent(this, FloatingWidgetActivity::class.java)
        startActivity(intent)
    }
}

@Composable
fun MainScreen(
    uiState: MainViewModel.UiState,
    onStartFloatingWidget: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToDashboard: () -> Unit
) {
    when (uiState.currentScreen) {
        MainViewModel.Screen.Dashboard -> {
            DashboardScreen(
                onStartFloatingWidget = onStartFloatingWidget,
                onNavigateToSettings = onNavigateToSettings
            )
        }
        MainViewModel.Screen.Settings -> {
            SettingsScreen(
                onNavigateBack = onNavigateToDashboard
            )
        }
    }
}