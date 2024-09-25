package org.vechain.veworld.app.googleDrive

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.facebook.react.bridge.Promise
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class GoogleDriveViewModel: ViewModel() {
    fun test(promise: Promise) {
        viewModelScope.launch {
            delay(2000)
            promise.resolve("OK")
        }
    }
}