package com.solsnatcher.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor() : ViewModel() {
    
    sealed class Screen {
        object Dashboard : Screen()
        object Settings : Screen()
    }
    
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    data class UiState(
        val currentScreen: Screen = Screen.Dashboard,
        val isLoading: Boolean = false,
        val error: String? = null
    )
    
    fun navigateToDashboard() {
        _uiState.value = _uiState.value.copy(currentScreen = Screen.Dashboard)
    }
    
    fun navigateToSettings() {
        _uiState.value = _uiState.value.copy(currentScreen = Screen.Settings)
    }
    
    fun setLoading(loading: Boolean) {
        _uiState.value = _uiState.value.copy(isLoading = loading)
    }
    
    fun setError(error: String?) {
        _uiState.value = _uiState.value.copy(error = error)
    }
}