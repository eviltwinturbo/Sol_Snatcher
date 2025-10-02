package com.solsnatcher

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class SolSnatcherApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
    }
}