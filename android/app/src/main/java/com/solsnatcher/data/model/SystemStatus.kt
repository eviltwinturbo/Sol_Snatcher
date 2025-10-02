package com.solsnatcher.data.model

import com.google.gson.annotations.SerializedName

data class SystemStatus(
    @SerializedName("wallets")
    val wallets: Int,
    
    @SerializedName("activePositions")
    val activePositions: Int,
    
    @SerializedName("busyWallets")
    val busyWallets: Int,
    
    @SerializedName("totalBalance")
    val totalBalance: Double,
    
    @SerializedName("totalPnL")
    val totalPnL: Double
)