package com.solsnatcher.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun WalletCard(
    walletId: String,
    balance: Double,
    busy: Boolean,
    dailyPnL: Double,
    totalPnL: Double
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (busy) Color.Red.copy(alpha = 0.1f) else Color.Green.copy(alpha = 0.1f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = walletId.uppercase(),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (busy) Color.Red else Color.Green)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Balance",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${balance} SOL",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                Column {
                    Text(
                        text = "Daily P&L",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${if (dailyPnL >= 0) "+" else ""}${dailyPnL} USD",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (dailyPnL >= 0) Color.Green else Color.Red
                    )
                }
                
                Column {
                    Text(
                        text = "Total P&L",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${if (totalPnL >= 0) "+" else ""}${totalPnL} USD",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (totalPnL >= 0) Color.Green else Color.Red
                    )
                }
            }
        }
    }
}