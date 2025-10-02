package com.solsnatcher.data.model

import com.google.gson.annotations.SerializedName

data class Wallet(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("pubkey")
    val pubkey: String,
    
    @SerializedName("path")
    val path: String,
    
    @SerializedName("riskPctPerTrade")
    val riskPctPerTrade: Double,
    
    @SerializedName("balance")
    val balance: Double,
    
    @SerializedName("busy")
    val busy: Boolean,
    
    @SerializedName("dailyPnL")
    val dailyPnL: Double,
    
    @SerializedName("totalPnL")
    val totalPnL: Double
)