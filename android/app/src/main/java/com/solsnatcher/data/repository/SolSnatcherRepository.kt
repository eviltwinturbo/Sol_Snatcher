package com.solsnatcher.data.repository

import com.solsnatcher.data.api.SolSnatcherApi
import com.solsnatcher.data.model.Position
import com.solsnatcher.data.model.SystemStatus
import com.solsnatcher.data.model.Wallet
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SolSnatcherRepository @Inject constructor(
    private val api: SolSnatcherApi
) {
    
    suspend fun getWallets(): Result<List<Wallet>> {
        return try {
            val response = api.getWallets()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch wallets: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getWallet(walletId: String): Result<Wallet> {
        return try {
            val response = api.getWallet(walletId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: throw Exception("Wallet not found"))
            } else {
                Result.failure(Exception("Failed to fetch wallet: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPositions(walletId: String? = null): Result<List<Position>> {
        return try {
            val response = api.getPositions(walletId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch positions: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getSystemStatus(): Result<SystemStatus> {
        return try {
            val response = api.getSystemStatus()
            if (response.isSuccessful) {
                Result.success(response.body() ?: throw Exception("System status not available"))
            } else {
                Result.failure(Exception("Failed to fetch system status: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}