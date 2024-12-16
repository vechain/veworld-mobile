package org.vechain.veworld.app.googleDrive.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import org.vechain.veworld.app.googleDrive.data.GoogleDrive


class GoogleDriveViewModelFactory(private val googleDrive: GoogleDrive) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GoogleDriveViewModel::class.java)) {
            return GoogleDriveViewModel(googleDrive) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}