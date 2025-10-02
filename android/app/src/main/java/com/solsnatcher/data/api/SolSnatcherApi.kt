package com.solsnatcher.data.api

import com.solsnatcher.data.model.Position
import com.solsnatcher.data.model.SystemStatus
import com.solsnatcher.data.model.Wallet
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface SolSnatcherApi {
    
    @GET("wallets")
    suspend fun getWallets(): Response<List<Wallet>>
    
    @GET("wallets/{walletId}")
    suspend fun getWallet(@Query("walletId") walletId: String): Response<Wallet>
    
    @GET("positions")
    suspend fun getPositions(@Query("walletId") walletId: String? = null): Response<List<Position>>
    
    @GET("status")
    suspend fun getSystemStatus(): Response<SystemStatus>
}