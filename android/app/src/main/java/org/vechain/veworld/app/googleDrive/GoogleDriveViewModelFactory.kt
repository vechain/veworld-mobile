package org.vechain.veworld.app.googleDrive

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.facebook.react.bridge.ReactApplicationContext

class GoogleDriveViewModelFactory(private val reactApplicationContext: ReactApplicationContext) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GoogleDriveViewModel::class.java)) {
            return GoogleDriveViewModel(reactApplicationContext) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}