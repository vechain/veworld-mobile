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

    companion object {
        const val ACTIVITY_NULL = "Activity cannot be null"
        const val OAUTH_INTERRUPTED = "Oauth process has been interrupted"
        const val FAILED_TO_GET_DRIVE = "Failed to get google drive account"
        const val FAILED_TO_LOCATE_WALLET = "Failed to locate wallet"
        const val FAILED_TO_DELETE_WALLET = "Failed to delete wallet"
        const val FAILED_TO_GET_WALLET = "Failed to retrieve wallet"
        const val FAILED_TO_GET_SALT = "Failed to retrieve salt"
        const val FAILED_TO_GET_IV = "Failed to retrieve IV"
        const val FAILED_GOOGLE_SIGN_OUT = "Failed to Sign out from Google Account"
        const val UNAUTHORIZED = "Action not permitted"
    }

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

    @ReactMethod
    fun googleAccountSignOut(promise: Promise) {
        initViewModel()
        viewModel?.googleAccountSignOut(promise)
    }
}