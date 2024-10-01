package org.vechain.veworld.app.googleDrive

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import java.util.Date

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
    fun checkGoogleServicesAvailability(promise: Promise) {
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(reactContext)
        promise.resolve(resultCode == ConnectionResult.SUCCESS)
    }

    @ReactMethod
    fun saveToGoogleDrive(
        rootAddress: String,
        data: String,
        walletType: String,
        firstAccountAddress: String,
        salt: String,
        iv: String,
        derivationPath: String, promise: Promise,
    ) {
        initViewModel()

        val backupFile = BackupFile(
            rootAddress = rootAddress,
            data = data,
            walletType = walletType,
            firstAccountAddress = firstAccountAddress,
            derivationPath = derivationPath,
            salt = salt,
            iv = iv,
            creationDate = Date().time / 1000.0
        )

        viewModel?.saveToGoogleDrive(backupFile, reactContext, promise)
    }

    @ReactMethod
    fun getAllWalletsFromGoogleDrive(promise: Promise) {
        initViewModel()
        viewModel?.getAllWalletsFromGoogleDrive(reactContext, promise)
    }

    @ReactMethod
    fun getWallet(rootAddress: String, promise: Promise) {
        initViewModel()
        viewModel?.getWallet(rootAddress, reactContext, promise)
    }

    @ReactMethod
    fun getSalt(rootAddress: String, promise: Promise) {
        initViewModel()
        viewModel?.getSalt(rootAddress, reactContext, promise)
    }

    @ReactMethod
    fun getIV(rootAddress: String, promise: Promise) {
        initViewModel()
        viewModel?.getIV(rootAddress, reactContext, promise)
    }

    @ReactMethod
    fun deleteWallet(rootAddress: String, promise: Promise) {
        initViewModel()
        viewModel?.deleteWallet(rootAddress, reactContext, promise)
    }
}