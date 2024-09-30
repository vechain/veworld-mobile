package org.vechain.veworld.app.googleDrive

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

class GoogleDriveManager(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var viewModel: GoogleDriveViewModel? = null

    private fun initViewModel() {
        if (viewModel == null) {
            currentActivity?.let {
                viewModel =
                    ViewModelProvider(it as ViewModelStoreOwner)[GoogleDriveViewModel::class.java]
            }
        }
    }

    override fun getName(): String = "GoogleDriveManager"

    @ReactMethod
    fun test(promise: Promise) {
        initViewModel()
        viewModel?.test(promise)
    }

    @ReactMethod
    fun areGoogleServicesAvailable(promise: Promise) {
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(reactContext)
        promise.resolve(resultCode == ConnectionResult.SUCCESS)
    }

    @ReactMethod
    fun backupMnemonicToCloud(promise: Promise) {
        initViewModel()
        viewModel?.backupMnemonicToCloud(reactContext, promise)
    }

    @ReactMethod
    fun fetchMnemonicBackups(promise: Promise) {
        initViewModel()
        viewModel?.fetchMnemonicBackups(reactContext, promise)
    }

    @ReactMethod
    fun saveMnemonicToGoogleDrive(promise: Promise) {
        initViewModel()
        viewModel?.deleteCloudStorageMnemonicBackup(reactContext, promise)
    }
}