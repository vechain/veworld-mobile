package org.vechain.veworld.app.googleDrive

import android.app.Activity
import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException
import com.google.api.client.http.ByteArrayContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.api.services.drive.model.File
import com.google.api.services.drive.model.FileList
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.vechain.veworld.app.R
import org.vechain.veworld.app.googleDrive.domain.DriveBackupFile
import java.io.ByteArrayOutputStream
import java.io.FileNotFoundException
import java.nio.charset.StandardCharsets

const val REQUEST_AUTHORIZATION = 1234

object Constants {
    const val SPACE = "drive"
    const val FOLDER_NAME = "VeWorld"
    const val WALLET_ZONE = "WALLET_ZONE"
}

enum class Request(val value: Int) {
    GOOGLE_SIGN_IN(122),
    REQUEST_AUTHORIZATION(1234)
}

object GDriveParams {
    // const val SPACES = "appDataFolder"
    const val FIELDS = "nextPageToken, files(id, name)"
    const val PAGE_SIZE_SINGLE = 1
}

class GoogleDriveViewModel(
    private val reactContext: ReactApplicationContext,
) : ViewModel() {
    private val gson: Gson = Gson()
    private var googleSignInClient: GoogleSignInClient? = null
    private var pendingOperation: (() -> Unit)? = null
    private val activityResultHandlers = mutableMapOf<Int, (Int, Activity?, Intent?) -> Unit>()

    private val activityListener = object : ActivityEventListener {
        override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            data: Intent?,
        ) {
            if (requestCode == REQUEST_AUTHORIZATION && resultCode == Activity.RESULT_OK) {
                pendingOperation?.invoke()
            }
        }

        override fun onNewIntent(p0: Intent?) {}
    }

    init {
        reactContext.addActivityEventListener(activityListener)
    }

    override fun onCleared() {
        super.onCleared()
        reactContext.removeActivityEventListener(activityListener)
    }

    fun onActivityResultHandler(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        intent: Intent?,
    ) {
        val handler = activityResultHandlers[requestCode]
        handler?.invoke(resultCode, activity, intent)
    }

    private fun registerHandler(
        requestCode: Int,
        handler: (Int, Activity?, Intent?) -> Unit,
    ) {
        activityResultHandlers[requestCode] = handler
    }

    private fun unregisterHandler(requestCode: Int) {
        activityResultHandlers.remove(requestCode)
    }


    private fun hasPermissionToGoogleDrive(
        reactContext: ReactApplicationContext,
        account: GoogleSignInAccount?,
    ): Boolean {
        val hasPermissions =
            account?.let {
                GoogleSignIn.hasPermissions(
                    account,
                    Scope(DriveScopes.DRIVE_FILE),
                    Scope(DriveScopes.DRIVE_APPDATA)
                )
            }
        return hasPermissions == true
    }

    private fun getGoogleSignInClient(reactContext: ReactApplicationContext): GoogleSignInClient {
        val activity = reactContext.currentActivity
        if (activity != null) {
            val signInOptions =
                GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN).requestEmail()
                    .requestScopes(
                        Scope(DriveScopes.DRIVE_FILE), Scope(DriveScopes.DRIVE_APPDATA)
                    ).build()
            return GoogleSignIn.getClient(activity, signInOptions)
        } else {
            throw IllegalStateException(GoogleDrivePackage.ACTIVITY_NULL)
        }
    }

    private suspend fun getGoogleDrivePermissions(reactContext: ReactApplicationContext): GoogleSignInAccount? =
        suspendCancellableCoroutine { continuation ->
            try {
                /*if (googleSignInClient != null) {
                    val account = GoogleSignIn.getLastSignedInAccount(reactContext)

                    if (hasPermissionToGoogleDrive(reactContext, account)) {
                        continuation.resumeWith(Result.success(account))
                    } else {
                        googleSignInClient?.signOut()
                        googleSignInClient = null
                        continuation.resumeWith(Result.failure(Exception(GoogleDriveManager.OAUTH_INTERRUPTED)))
                    }
                    return@suspendCancellableCoroutine
                }*/

                googleSignInClient = getGoogleSignInClient(reactContext)
                val signInIntent = googleSignInClient?.signInIntent

                registerHandler(Request.GOOGLE_SIGN_IN.value) { resultCode, _, intent ->
                    unregisterHandler(Request.GOOGLE_SIGN_IN.value)

                    if (resultCode == Activity.RESULT_OK) {
                        val signInTask = GoogleSignIn.getSignedInAccountFromIntent(intent)
                        val account: GoogleSignInAccount? =
                            signInTask.getResult(ApiException::class.java)

                        if (hasPermissionToGoogleDrive(reactContext, account)) {
                            continuation.resumeWith(Result.success(account))
                        } else {
                            googleSignInClient?.signOut()
                            googleSignInClient = null
                            continuation.resumeWith(Result.failure(Exception(GoogleDrivePackage.OAUTH_INTERRUPTED)))
                        }

                    } else {
                        googleSignInClient?.signOut()
                        googleSignInClient = null
                        continuation.resumeWith(Result.failure(Exception(GoogleDrivePackage.OAUTH_INTERRUPTED)))
                    }
                }

                reactContext.currentActivity?.startActivityForResult(
                    signInIntent, Request.GOOGLE_SIGN_IN.value
                )

            } catch (e: Exception) {
                continuation.resumeWith(
                    Result.failure(
                        Exception(GoogleDrivePackage.FAILED_TO_GET_DRIVE)
                    )
                )
            }
        }

    private suspend fun getGoogleDrive(
        reactContext: ReactApplicationContext,
    ): Pair<Drive?, GoogleSignInAccount?> {
        return withContext(Dispatchers.IO) {
            val account = getGoogleDrivePermissions(reactContext)
            val drive = account?.let {
                val credential = GoogleAccountCredential.usingOAuth2(
                    reactContext, listOf(DriveScopes.DRIVE_FILE, DriveScopes.DRIVE_APPDATA)
                )

                credential.selectedAccount = account.account!!

                Drive.Builder(
                    NetHttpTransport(), GsonFactory.getDefaultInstance(), credential
                ).setApplicationName(reactContext.getString(R.string.app_name)).build()
            }

            if (drive == null) {
                googleSignInClient = null
            }

            Pair(drive, account)
        }
    }

    private fun getFileIdByFileName(
        drive: Drive,
        name: String,
        folderId: String,
    ): String? {
        val files: FileList =
            drive.files().list().setSpaces(Constants.SPACE).setFields(GDriveParams.FIELDS)
                .setPageSize(GDriveParams.PAGE_SIZE_SINGLE)
                .setQ("'$folderId' in parents and trashed=false and name ='$name.json'")
                .execute()
        return files.files.firstOrNull()?.id
    }

    private fun getFolderById(drive: Drive): String? {
        val result = drive.files().list()
            .setQ("mimeType='application/vnd.google-apps.folder' and name='${Constants.FOLDER_NAME}' and trashed=false")
            .setSpaces(Constants.SPACE).setFields("files(id, name)").execute()
        return result.files.firstOrNull()?.id
    }

    private fun createFolder(drive: Drive): String? {
        val fileMetadata = File()
        fileMetadata.name = Constants.FOLDER_NAME
        fileMetadata.mimeType = "application/vnd.google-apps.folder"
        val folder = drive.files().create(fileMetadata).setFields("id").execute()
        return folder.id
    }

    private fun saveMnemonicToGoogleDrive(
        drive: Drive,
        fileName: String,
        backup: DriveBackupFile,
    ) {
        val fileMetadata = File()
        fileMetadata.name = "$fileName.json"

        val folderId =
            getFolderById(drive) ?: createFolder(drive)

        folderId?.let {
            fileMetadata.parents = listOf(it)

            val jsonData = gson.toJson(backup)
            val jsonByteArray = jsonData.toByteArray(StandardCharsets.UTF_8)
            val inputContent = ByteArrayContent("application/json", jsonByteArray)
            val fileId = getFileIdByFileName(drive, fileName, folderId)
            if (fileId != null) {
                drive.files().delete(fileId).execute()
            }
            drive.files().create(fileMetadata, inputContent).execute()
        }
    }

    private suspend fun fetchCloudBackupFiles(
        drive: Drive,
    ): FileList {
        val allFiles = FileList()
        allFiles.files = mutableListOf()

        withContext(Dispatchers.IO) {
            val folderId = getFolderById(drive)

            folderId?.let { id ->
                var pageToken: String? = null

                do {
                    val result =
                        drive.files().list().setSpaces(Constants.SPACE)
                            .setFields(GDriveParams.FIELDS)
                            .setQ("'$id' in parents and trashed = false")
                            .setPageToken(pageToken).execute()

                    result.files?.let {
                        allFiles.files.addAll(it)
                    }

                    pageToken = result.nextPageToken

                } while (pageToken != null)
            }
        }

        return allFiles
    }

    fun getAllWalletsFromGoogleDrive(reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                val mnemonics = mutableListOf<DriveBackupFile>()

                getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) return@launch
                    fetchCloudBackupFiles(drive).let { files ->
                        withContext(Dispatchers.IO) {
                            files.files.forEach { file ->
                                launch {
                                    val outputStream = ByteArrayOutputStream()
                                    drive.files()[file.id].executeMediaAndDownloadTo(
                                        outputStream
                                    )
                                    val driveBackupFile: DriveBackupFile = gson.fromJson(
                                        outputStream.toString(), DriveBackupFile::class.java
                                    )
                                    mnemonics.add(driveBackupFile)
                                }
                            }
                        }
                    }
                }

                val writableNativeArray = WritableNativeArray()
                mnemonics.forEach {
                    writableNativeArray.pushMap(it.toWritableMap())
                }

                promise.resolve(writableNativeArray)
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "cloudError",
                    GoogleDrivePackage.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("cloudError", e.message, e)
            }
        }
    }

    fun saveToGoogleDrive(
        wallet: DriveBackupFile,
        reactContext: ReactApplicationContext,
        promise: Promise,
    ) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext).let { (drive, acc) ->
                    if (drive == null) return@launch

                    withContext(Dispatchers.IO) {
                        saveMnemonicToGoogleDrive(
                            drive,
                            "${Constants.WALLET_ZONE}_${wallet.rootAddress}",
                            wallet
                        )
                    }
                }
                promise.resolve(true)
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "deleteBackupError",
                    GoogleDrivePackage.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject(
                    "backupEncryptionError",
                    e.message,
                    e,
                )
            }
        }
    }


    fun deleteWallet(
        rootAddress: String,
        reactContext: ReactApplicationContext,
        promise: Promise,
    ) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) {
                        return@launch
                    }

                    withContext(Dispatchers.IO) {
                        val folderId = getFolderById(drive)

                        folderId?.let { id ->
                            val fileId = getFileIdByFileName(
                                drive,
                                "${Constants.WALLET_ZONE}_$rootAddress",
                                id
                            )
                            if (fileId != null) {
                                drive.files().delete(fileId).execute()
                            }
                        }
                    }
                }
                promise.resolve(true)
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "deleteBackupError",
                    GoogleDrivePackage.UNAUTHORIZED,
                    e
                )
            } catch (e: FileNotFoundException) {
                promise.reject(
                    "deleteBackupError",
                    GoogleDrivePackage.FAILED_TO_LOCATE_WALLET,
                    e
                )
            } catch (e: Exception) {
                promise.reject(
                    "deleteBackupError",
                    GoogleDrivePackage.FAILED_TO_DELETE_WALLET,
                    e
                )
            }
        }
    }

    fun getWallet(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        pendingOperation = {
            viewModelScope.launch {
                try {
                    getGoogleDrive(reactContext).let { (drive) ->
                        if (drive == null) {
                            return@launch
                        }

                        withContext(Dispatchers.IO) {
                            val folderId = getFolderById(drive)

                            folderId?.let { id ->
                                val fileId = getFileIdByFileName(
                                    drive,
                                    "${Constants.WALLET_ZONE}_$rootAddress",
                                    id
                                )
                                if (fileId != null) {
                                    val outputStream = ByteArrayOutputStream()
                                    drive.files()[fileId].executeMediaAndDownloadTo(outputStream)
                                    val driveBackupFile: DriveBackupFile = gson.fromJson(
                                        outputStream.toString(), DriveBackupFile::class.java
                                    )
                                    promise.resolve(driveBackupFile.toWritableMap())
                                    pendingOperation = null
                                    reactContext.removeActivityEventListener(activityListener)
                                    return@withContext
                                }
                            }

                            pendingOperation = null
                            reactContext.removeActivityEventListener(activityListener)
                            promise.resolve(null)
                        }
                    }
                } catch (e: UserRecoverableAuthIOException) {
                    reactContext.currentActivity?.startActivityForResult(
                        e.intent,
                        REQUEST_AUTHORIZATION
                    )
                } catch (e: Exception) {
                    reactContext.removeActivityEventListener(activityListener)
                    pendingOperation = null
                    reactContext.removeActivityEventListener(activityListener)
                    promise.reject("getWallet", GoogleDrivePackage.FAILED_TO_GET_WALLET, e)
                }
            }
        }

        pendingOperation?.invoke()
    }

    fun getSalt(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) {
                        return@launch
                    }

                    withContext(Dispatchers.IO) {
                        val folderId = getFolderById(drive)

                        folderId?.let { id ->
                            val fileId = getFileIdByFileName(
                                drive,
                                "${Constants.WALLET_ZONE}_$rootAddress",
                                id
                            )
                            if (fileId != null) {
                                val outputStream = ByteArrayOutputStream()
                                drive.files()[fileId].executeMediaAndDownloadTo(outputStream)
                                val driveBackupFile: DriveBackupFile = gson.fromJson(
                                    outputStream.toString(), DriveBackupFile::class.java
                                )
                                promise.resolve(WritableNativeMap().apply {
                                    putString(
                                        "salt",
                                        driveBackupFile.salt.value
                                    )
                                })
                            }
                        }
                    }
                }
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "getSalt",
                    GoogleDrivePackage.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("getSalt", GoogleDrivePackage.FAILED_TO_GET_SALT, e)
            }

        }
    }

    fun getIV(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) {
                        return@launch
                    }

                    withContext(Dispatchers.IO) {
                        val folderId = getFolderById(drive)

                        folderId?.let { id ->
                            val fileId = getFileIdByFileName(
                                drive,
                                "${Constants.WALLET_ZONE}_$rootAddress",
                                id
                            )
                            if (fileId != null) {
                                val outputStream = ByteArrayOutputStream()
                                drive.files()[fileId].executeMediaAndDownloadTo(outputStream)
                                val driveBackupFile: DriveBackupFile = gson.fromJson(
                                    outputStream.toString(), DriveBackupFile::class.java
                                )
                                promise.resolve(WritableNativeMap().apply {
                                    putString(
                                        "iv",
                                        driveBackupFile.iv.value
                                    )
                                })
                            }
                        }
                    }
                }
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "getIV",
                    GoogleDrivePackage.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("getIV", GoogleDrivePackage.FAILED_TO_GET_IV, e)
            }
        }
    }

    fun googleAccountSignOut(promise: Promise) {
        try {
            googleSignInClient?.signOut()
            googleSignInClient = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("googleAccountSignOut", GoogleDrivePackage.FAILED_GOOGLE_SIGN_OUT, e)
        }
    }
}