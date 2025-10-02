package com.solsnatcher.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solsnatcher.data.model.Position
import com.solsnatcher.data.model.SystemStatus
import com.solsnatcher.data.model.Wallet
import com.solsnatcher.data.repository.SolSnatcherRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FloatingWidgetViewModel @Inject constructor(
    private val repository: SolSnatcherRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    data class UiState(
        val wallets: List<Wallet> = emptyList(),
        val positions: List<Position> = emptyList(),
        val systemStatus: SystemStatus? = null,
        val isExpanded: Boolean = false,
        val isLoading: Boolean = false,
        val error: String? = null,
        val lastUpdate: Long = 0L
    )
    
    init {
        refreshData()
        // Set up periodic refresh
        viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(5000) // Refresh every 5 seconds
                refreshData()
            }
        }
    }
    
    fun refreshData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val walletsResult = repository.getWallets()
                val positionsResult = repository.getPositions()
                val statusResult = repository.getSystemStatus()
                
                val wallets = walletsResult.getOrElse { emptyList() }
                val positions = positionsResult.getOrElse { emptyList() }
                val status = statusResult.getOrNull()
                
                _uiState.value = _uiState.value.copy(
                    wallets = wallets,
                    positions = positions,
                    systemStatus = status,
                    isLoading = false,
                    lastUpdate = System.currentTimeMillis()
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Unknown error"
                )
            }
        }
    }
    
    fun toggleExpanded() {
        _uiState.value = _uiState.value.copy(
            isExpanded = !_uiState.value.isExpanded
        )
    }
    
    fun getWalletPosition(walletId: String): Position? {
        return _uiState.value.positions.find { 
            it.walletId == walletId && it.status == "open" 
        }
    }
}