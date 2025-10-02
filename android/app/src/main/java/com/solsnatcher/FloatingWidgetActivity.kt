package com.solsnatcher

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solsnatcher.ui.screens.FloatingWidgetScreen
import com.solsnatcher.ui.theme.SolSnatcherTheme
import com.solsnatcher.ui.viewmodel.FloatingWidgetViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class FloatingWidgetActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            SolSnatcherTheme {
                val viewModel: FloatingWidgetViewModel = viewModel()
                val uiState by viewModel.uiState.collectAsState()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FloatingWidgetScreen(
                        uiState = uiState,
                        onClose = { finish() },
                        onToggleExpanded = { viewModel.toggleExpanded() },
                        onRefresh = { viewModel.refreshData() }
                    )
                }
            }
        }
    }
}