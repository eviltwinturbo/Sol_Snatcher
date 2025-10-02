package com.solsnatcher.data.model

import com.google.gson.annotations.SerializedName

data class Position(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("walletId")
    val walletId: String,
    
    @SerializedName("mint")
    val mint: String,
    
    @SerializedName("baseQty")
    val baseQty: Double,
    
    @SerializedName("avgCost")
    val avgCost: Double,
    
    @SerializedName("tpPct")
    val tpPct: Double,
    
    @SerializedName("slPct")
    val slPct: Double,
    
    @SerializedName("trailingPct")
    val trailingPct: Double,
    
    @SerializedName("status")
    val status: String,
    
    @SerializedName("createdAt")
    val createdAt: String,
    
    @SerializedName("updatedAt")
    val updatedAt: String
)