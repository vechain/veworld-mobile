package org.vechain.veworld.app.googleDrive

import android.app.Activity
import android.content.Intent
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException
import com.google.api.services.drive.Drive
import com.facebook.react.bridge.Promise
import java.lang.Exception
import java.util.Date
import org.vechain.veworld.app.googleDrive.data.GoogleDrive
import org.vechain.veworld.app.googleDrive.domain.DerivationPath
import org.vechain.veworld.app.googleDrive.domain.DeviceType
import org.vechain.veworld.app.googleDrive.domain.DriveBackupFile
import org.vechain.veworld.app.googleDrive.domain.Iv
import org.vechain.veworld.app.googleDrive.domain.Request
import org.vechain.veworld.app.googleDrive.domain.Salt
import org.vechain.veworld.app.googleDrive.presentation.GoogleDriveViewModel
import org.vechain.veworld.app.googleDrive.presentation.GoogleDriveViewModelFactory
import org.vechain.veworld.app.googleDrive.util.DataError
import org.vechain.veworld.app.googleDrive.util.Result

class GoogleDrivePackage(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
    private lateinit var viewModel: GoogleDriveViewModel
    private var googleDrive: GoogleDrive? = null

    override fun getName(): String = "GoogleDriveManager"

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getConstants(): MutableMap<String, Any> =
            hashMapOf(
                    DataError.Drive.USER_UNRECOVERABLE_AUTH.name to
                            DataError.Drive.USER_UNRECOVERABLE_AUTH.code,
                    DataError.Drive.DRIVE_CREATION.name to DataError.Drive.DRIVE_CREATION.code,
                    DataError.Drive.OAUTH_INTERRUPTED.name to
                            DataError.Drive.OAUTH_INTERRUPTED.code,
                    DataError.Drive.DELETE_BACKUP.name to DataError.Drive.DELETE_BACKUP.code,
                    DataError.Drive.FOLDER_NOT_FOUND.name to DataError.Drive.FOLDER_NOT_FOUND.code,
                    DataError.Drive.SIGN_IN_INTENT_CREATION.name to
                            DataError.Drive.SIGN_IN_INTENT_CREATION.code,
                    DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE.name to
                            DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE.code,
                    DataError.Drive.SIGN_IN_INTENT_IS_NULL.name to
                            DataError.Drive.SIGN_IN_INTENT_IS_NULL.code,
                    DataError.Drive.GET_ACCOUNT.name to DataError.Drive.GET_ACCOUNT.code,
                    DataError.Drive.CHECK_PERMISSIONS.name to
                            DataError.Drive.CHECK_PERMISSIONS.code,
                    DataError.Drive.PERMISSION_GRANTED.name to
                            DataError.Drive.PERMISSION_GRANTED.code,
                    DataError.Drive.GET_ALL_BACKUPS.name to DataError.Drive.GET_ALL_BACKUPS.code,
                    DataError.Drive.GET_BACKUP.name to DataError.Drive.GET_BACKUP.code,
                    DataError.Drive.SIGN_OUT.name to DataError.Drive.SIGN_OUT.code,
                    DataError.Device.UNKNOWN_TYPE.name to DataError.Device.UNKNOWN_TYPE.code,
                    DataError.Device.UNKNOWN_DERIVATION_PATH.name to
                            DataError.Device.UNKNOWN_DERIVATION_PATH.code,
                    DataError.Android.ACTIVITY_NOT_FOUND.name to
                            DataError.Android.ACTIVITY_NOT_FOUND.code,
            )

    private fun getActivityResultListener(
            successCallback: (drive: Drive?) -> Unit,
            errorCallback: (Result.Error<DataError.Drive>) -> Unit,
    ): ActivityEventListener {
        return object : ActivityEventListener {
            override fun onActivityResult(
                    activity: Activity?,
                    requestCode: Int,
                    resultCode: Int,
                    intent: Intent?,
            ) {
                reactContext.removeActivityEventListener(this)

                if (requestCode == Request.GOOGLE_SIGN_IN.code) {
                    if (resultCode == Activity.RESULT_OK) {
                        when (val result = viewModel.getDrive(intent)) {
                            is Result.Success -> successCallback(result.data)
                            is Result.Error -> {
                                errorCallback(result)
                            }
                        }
                    } else {
                        errorCallback(Result.Error(DataError.Drive.OAUTH_INTERRUPTED))
                    }
                }

                if (requestCode == Request.USER_RECOVERABLE_AUTH.code) {
                    if (resultCode == Activity.RESULT_OK) {
                        successCallback(null)
                    } else {
                        errorCallback(Result.Error(DataError.Drive.OAUTH_INTERRUPTED))
                    }
                }
            }

            override fun onNewIntent(p0: Intent?) {}
        }
    }

    private fun startGoogleDriveOperation(promise: Promise, operation: (Drive) -> Unit) {
        viewModel.getLastSignedAccount { result ->
            when (result) {
                is Result.Success -> {
                    val account = result.data
                    val drive =
                            when (val driveResult = viewModel.getDriveFromAccount(account)) {
                                is Result.Success -> driveResult.data
                                is Result.Error -> {
                                    promise.reject(
                                            driveResult.error.code,
                                            driveResult.error.name,
                                            driveResult.throwable
                                    )
                                    return@getLastSignedAccount
                                }
                            }

                    operation.invoke(drive)
                }
                is Result.Error -> {
                    val intent =
                            when (val signInResult = viewModel.getSignInIntent()) {
                                is Result.Success -> signInResult.data
                                is Result.Error -> {
                                    promise.reject(
                                            signInResult.error.code,
                                            signInResult.error.name,
                                            signInResult.throwable
                                    )
                                    return@getLastSignedAccount
                                }
                            }

                    val listener =
                            getActivityResultListener(
                                    successCallback = { drive ->
                                        drive?.let { operation.invoke(it) }
                                        return@getActivityResultListener
                                    },
                                    errorCallback = { listenerResult ->
                                        promise.reject(
                                                listenerResult.error.code,
                                                listenerResult.error.name,
                                                listenerResult.throwable
                                        )
                                        return@getActivityResultListener
                                    }
                            )

                    reactContext.addActivityEventListener(listener)

                    currentActivity?.startActivityForResult(intent, Request.GOOGLE_SIGN_IN.code)
                            ?: promise.reject(
                                    DataError.Android.ACTIVITY_NOT_FOUND.code,
                                    DataError.Android.ACTIVITY_NOT_FOUND.name,
                                    Exception(DataError.Android.ACTIVITY_NOT_FOUND.name)
                            )
                }
            }
        }
    }

    private fun userRecoverableAuthExceptionHandler(
            intent: Intent,
            promise: Promise,
            operation: () -> Unit,
    ) {
        val listener =
                getActivityResultListener(
                        successCallback = {
                            operation.invoke()
                            return@getActivityResultListener
                        },
                        errorCallback = { result ->
                            promise.reject(result.error.code, result.error.name, result.throwable)
                            return@getActivityResultListener
                        }
                )

        reactContext.addActivityEventListener(listener)

        currentActivity?.startActivityForResult(intent, Request.USER_RECOVERABLE_AUTH.code)
                ?: promise.reject(
                        DataError.Android.ACTIVITY_NOT_FOUND.code,
                        DataError.Android.ACTIVITY_NOT_FOUND.name,
                        Exception(DataError.Android.ACTIVITY_NOT_FOUND.name)
                )
    }

    @ReactMethod
    fun checkGoogleServicesAvailability(promise: Promise) {
        promise.resolve(viewModel.areGoogleServicesAvailable())
    }

    private fun backupToCloud(
            drive: Drive,
            backupFile: DriveBackupFile,
            promise: Promise,
            isRetry: Boolean = false,
    ) {
        viewModel.saveBackup(drive, backupFile) { result ->
            when (result) {
                is Result.Success -> {
                    promise.resolve(null)
                }
                is Result.Error -> {
                    if (result.error == DataError.Drive.USER_UNRECOVERABLE_AUTH) {
                        val exception = result.throwable as UserRecoverableAuthIOException
                        val intent = exception.intent

                        val operation = { backupToCloud(drive, backupFile, promise, true) }
                        userRecoverableAuthExceptionHandler(intent, promise, operation)
                    } else {
                        googleDrive?.signOut()
                        promise.reject(result.error.code, result.error.name, result.throwable)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun saveToGoogleDrive(
            rootAddress: String,
            data: String,
            walletType: String,
            firstAccountAddress: String,
            salt: String,
            iv: String,
            derivationPath: String,
            promise: Promise,
    ) {
        val transformedDerivationPath =
                when (val result = DerivationPath.fromType(derivationPath)) {
                    is Result.Success -> result.data
                    is Result.Error ->
                            return promise.reject(
                                    result.error.code,
                                    result.error.name,
                                    Exception(result.error.name)
                            )
                }

        val transformedDeviceType =
                when (val result = DeviceType.fromType(walletType)) {
                    is Result.Success -> result.data
                    is Result.Error ->
                            return promise.reject(
                                    result.error.code,
                                    result.error.name,
                                    result.throwable
                            )
                }

        val backupFile =
                DriveBackupFile(
                        rootAddress = rootAddress,
                        data = data,
                        walletType = transformedDeviceType,
                        firstAccountAddress = firstAccountAddress,
                        derivationPath = transformedDerivationPath,
                        salt = Salt(salt),
                        iv = Iv(iv),
                        creationDate = Date().time / 1000.0
                )

        val operation = { drive: Drive -> backupToCloud(drive, backupFile, promise, false) }

        startGoogleDriveOperation(promise, operation)
    }

    private fun getAllBackups(drive: Drive, promise: Promise, isRetry: Boolean = false) {
        viewModel.getAllBackups(drive) { result ->
            when (result) {
                is Result.Success -> {
                    val backups = result.data
                    val writableNativeArray = WritableNativeArray()
                    backups.forEach { writableNativeArray.pushMap(it.toWritableMap()) }
                    promise.resolve(writableNativeArray)
                }
                is Result.Error -> {
                    if (result.error == DataError.Drive.FOLDER_NOT_FOUND) {
                        promise.resolve(WritableNativeArray())
                    } else if (result.error == DataError.Drive.USER_UNRECOVERABLE_AUTH && !isRetry
                    ) {
                        val exception = result.throwable as UserRecoverableAuthIOException
                        val intent = exception.intent

                        val operation = { getAllBackups(drive, promise, true) }
                        userRecoverableAuthExceptionHandler(intent, promise, operation)
                    } else {
                        promise.reject(result.error.code, result.error.name, result.throwable)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun getAllWalletsFromGoogleDrive(promise: Promise) {
        val operation = { drive: Drive -> getAllBackups(drive, promise, false) }

        startGoogleDriveOperation(promise, operation)
    }

    private fun getBackup(
            drive: Drive,
            rootAddress: String,
            promise: Promise,
            isRetry: Boolean = false,
    ) {
        viewModel.getBackup(drive, "WALLET_ZONE_$rootAddress") { result ->
            when (result) {
                is Result.Success -> {
                    val backup = result.data
                    promise.resolve(backup?.toWritableMap())
                }
                is Result.Error -> {
                    if (result.error == DataError.Drive.FOLDER_NOT_FOUND) {
                        promise.resolve(null)
                    } else if (result.error == DataError.Drive.USER_UNRECOVERABLE_AUTH && !isRetry
                    ) {
                        val exception = result.throwable as UserRecoverableAuthIOException
                        val intent = exception.intent

                        val operation = { getBackup(drive, rootAddress, promise, true) }

                        userRecoverableAuthExceptionHandler(intent, promise, operation)
                    } else {
                        promise.reject(result.error.code, result.error.name, result.throwable)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun getWallet(rootAddress: String, promise: Promise) {
        val operation = { drive: Drive -> getBackup(drive, rootAddress, promise, false) }

        startGoogleDriveOperation(promise, operation)
    }

    @ReactMethod
    fun getSalt(rootAddress: String, promise: Promise) {
        promise.resolve(rootAddress)
    }

    @ReactMethod
    fun getIV(rootAddress: String, promise: Promise) {
        promise.resolve(rootAddress)
    }

    private fun deleteBackup(
            drive: Drive,
            rootAddress: String,
            promise: Promise,
            isRetry: Boolean = false,
    ) {
        viewModel.deleteBackup(drive, "WALLET_ZONE_$rootAddress") { result ->
            when (result) {
                is Result.Success -> {
                    promise.resolve(null)
                }
                is Result.Error -> {
                    if (result.error == DataError.Drive.FOLDER_NOT_FOUND) {
                        promise.resolve(null)
                    } else if (result.error == DataError.Drive.USER_UNRECOVERABLE_AUTH && !isRetry
                    ) {
                        val exception = result.throwable as UserRecoverableAuthIOException
                        val intent = exception.intent

                        val operation = { deleteBackup(drive, rootAddress, promise, true) }

                        userRecoverableAuthExceptionHandler(intent, promise, operation)
                    } else {
                        googleDrive?.signOut()
                        promise.reject(result.error.code, result.error.name, result.throwable)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun deleteWallet(rootAddress: String, promise: Promise) {
        val operation = { drive: Drive -> deleteBackup(drive, rootAddress, promise, false) }

        startGoogleDriveOperation(promise, operation)
    }

    @ReactMethod
    fun googleAccountSignOut(promise: Promise) {
        when (val result = viewModel.signOut()) {
            is Result.Success -> promise.resolve(null)
            is Result.Error ->
                    promise.reject(result.error.code, result.error.name, result.throwable)
        }
    }

    override fun onHostResume() {
        currentActivity?.let {
            if (googleDrive == null) {
                googleDrive = GoogleDrive(it)
            }

            viewModel =
                    ViewModelProvider(
                            it as ViewModelStoreOwner,
                            GoogleDriveViewModelFactory(googleDrive!!)
                    )[GoogleDriveViewModel::class.java]
        }
    }

    override fun onHostPause() {}

    override fun onHostDestroy() {}
}
