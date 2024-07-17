package org.vechain.veworld.app.drivemanager

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.util.Date

class DriveManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private val gson = Gson()

    override fun getName(): String {
        return MODULE_NAME
    }

    @ReactMethod
    fun checkDriveAvailability(promise: Promise) {
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(reactContext)
        promise.resolve(resultCode == ConnectionResult.SUCCESS)
    }

    @ReactMethod
    fun saveToDrive(
        mnemonic: String,
        firstAccountAddress: String,
        _rootAddress: String,
        deviceType: String,
        salt: String,
        promise: Promise,
    ) {
        CoroutineScope(Dispatchers.Default).launch {
            try {
                DriveServiceHelper.getGoogleDrive(reactContext).let { (drive, acc) ->
                    if (drive == null) return@launch
                    val createdAt = Date().time / 1000.0
                    val wallet = Wallet(
                        _rootAddress,
                        deviceType,
                        firstAccountAddress,
                        createdAt.toString(),
                        mnemonic,
                        salt
                    )
                    withContext(Dispatchers.IO) {
                        DriveServiceHelper.saveMnemonicToGoogleDrive(drive, wallet)
                    }
                }

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(
                    "",
                    "Failed to encrypt mnemonics: ${e.message}",
                    e,
                )
            }
        }

    }

    @ReactMethod
    fun getAllFromDrive(promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                DriveServiceHelper.getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) return@launch
                    val files = DriveServiceHelper.fetchCloudBackupFiles(drive)
                    val results = withContext(Dispatchers.IO) {
                        files.files.map { file ->
                            async {
                                try {
                                    val outputStream = ByteArrayOutputStream()
                                    drive.files()[file.id].executeMediaAndDownloadTo(outputStream)
                                    gson.fromJson(outputStream.toString(), Wallet::class.java)
                                } catch (e: Exception) {
                                    null
                                }

                            }
                        }
                    }
                    val wallets = results.awaitAll()
                    val writableArray = Arguments.createArray()

                    wallets.forEach {
                        writableArray.pushMap(it?.mapToReadableWallet())
                    }
                    promise.resolve(writableArray)
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("", "Failed to fetch cloud backups")
            }
        }
    }

    @ReactMethod
    fun getWallet(_rootAddress: String, promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            DriveServiceHelper.getGoogleDrive(reactContext).let { (drive) ->
                if (drive == null) return@launch
                val file = DriveServiceHelper.getFileIdByFileName(drive, _rootAddress)

                if (file != null) {
                    val outputStream = ByteArrayOutputStream()
                    drive.files()[file.id].executeMediaAndDownloadTo(outputStream)
                    val wallet = gson.fromJson(outputStream.toString(), Wallet::class.java)
                    promise.resolve(wallet.mapToReadableWallet())
                } else {
                    promise.resolve(null)
                }
            }
        }
    }

    companion object {
        const val MODULE_NAME = "DriveManager"
    }
}