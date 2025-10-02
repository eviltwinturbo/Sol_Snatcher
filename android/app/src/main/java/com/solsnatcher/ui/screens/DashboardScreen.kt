package com.solsnatcher.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.solsnatcher.ui.components.WalletCard
import com.solsnatcher.ui.components.SystemStatusCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onStartFloatingWidget: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Top App Bar
        TopAppBar(
            title = {
                Text(
                    text = "Sol $natcher",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = onNavigateToSettings) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings"
                    )
                }
            }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // System Status Card
        SystemStatusCard()
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Start Floating Widget Button
        Button(
            onClick = onStartFloatingWidget,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            Text(
                text = "Start Floating Widget",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Wallets Section
        Text(
            text = "Wallets",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Mock wallet data for demo
            items(6) { index ->
                WalletCard(
                    walletId = "wallet${index + 1}",
                    balance = 1.5 + index * 0.2,
                    busy = index % 3 == 0,
                    dailyPnL = (index - 2) * 0.1,
                    totalPnL = (index - 1) * 0.5
                )
            }
        }
    }
}