package org.vechain.veworld.app.googleDrive

import android.app.Activity
import android.content.Intent
import android.util.Log
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
    GOOGLE_SIGN_IN(122)
}

object GDriveParams {
    // const val SPACES = "appDataFolder"
    const val FIELDS = "nextPageToken, files(id, name)"
    const val PAGE_SIZE_SINGLE = 1
}

class GoogleDriveViewModel(
    private val gson: Gson = Gson(),
) : ViewModel() {
    private var googleSignInClient: GoogleSignInClient? = null

    private fun hasPermissionToGoogleDrive(reactContext: ReactApplicationContext): Boolean {
        val acc = GoogleSignIn.getLastSignedInAccount(reactContext)
        val hasPermissions =
            acc?.let { GoogleSignIn.hasPermissions(acc, Scope(DriveScopes.DRIVE_FILE)) }
        return hasPermissions == true
    }

    private fun getGoogleSignInClient(reactContext: ReactApplicationContext): GoogleSignInClient {
        val activity = reactContext.currentActivity
        if (activity != null) {
            val signInOptions =
                GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN).requestEmail()
                    .requestScopes(
                        Scope(DriveScopes.DRIVE_FILE),
                    ).build()
            return GoogleSignIn.getClient(activity, signInOptions)
        } else {
            throw IllegalStateException(GoogleDriveManager.ACTIVITY_NULL)
        }
    }

    private suspend fun getGoogleDrivePermissions(reactContext: ReactApplicationContext): GoogleSignInAccount? =
        suspendCancellableCoroutine { continuation ->
            try {
                if (googleSignInClient != null) {
                    val account = GoogleSignIn.getLastSignedInAccount(reactContext)
                    continuation.resumeWith(Result.success(account))
                    return@suspendCancellableCoroutine
                }

                googleSignInClient = getGoogleSignInClient(reactContext)
                val signInIntent = googleSignInClient?.signInIntent
                reactContext.currentActivity?.startActivityForResult(
                    signInIntent, Request.GOOGLE_SIGN_IN.value
                )

                val listener = object : ActivityEventListener {
                    override fun onActivityResult(
                        activity: Activity?,
                        requestCode: Int,
                        resultCode: Int,
                        intent: Intent?,
                    ) {
                        // Remove the listener after using it
                        reactContext.removeActivityEventListener(this)
                        if (requestCode == Request.GOOGLE_SIGN_IN.value && resultCode == Activity.RESULT_OK) {

                            val signInTask = GoogleSignIn.getSignedInAccountFromIntent(intent)
                            val account: GoogleSignInAccount? =
                                signInTask.getResult(ApiException::class.java)
                            continuation.resumeWith(Result.success(account))

                        } else {
                            continuation.resumeWith(Result.failure(Exception(GoogleDriveManager.OAUTH_INTERRUPTED)))
                            googleSignInClient?.signOut()
                            googleSignInClient = null
                        }
                    }

                    override fun onNewIntent(p0: Intent?) {}
                }

                reactContext.addActivityEventListener(listener)
            } catch (e: Exception) {
                continuation.resumeWith(
                    Result.failure(
                        Exception(GoogleDriveManager.FAILED_TO_GET_DRIVE)
                    )
                )
            }
        }

    private suspend fun getGoogleDrive(
        reactContext: ReactApplicationContext,
        useRecentAccount: Boolean = false,
    ): Pair<Drive?, GoogleSignInAccount?> {
        return withContext(Dispatchers.IO) {
            val canUseRecentAccount = useRecentAccount && hasPermissionToGoogleDrive(reactContext)

            val account = if (canUseRecentAccount) {
                GoogleSignIn.getLastSignedInAccount(reactContext)
            } else {
                getGoogleDrivePermissions(reactContext)
            }

            val drive = account?.let {
                val credential = GoogleAccountCredential.usingOAuth2(
                    reactContext, listOf(DriveScopes.DRIVE_APPDATA)
                )

                credential.selectedAccount = account.account!!

                Drive.Builder(
                    NetHttpTransport(), GsonFactory.getDefaultInstance(), credential
                ).setApplicationName(reactContext.getString(R.string.app_name)).build()
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
        return try {
            val result = drive.files().list()
                .setQ("mimeType='application/vnd.google-apps.folder' and name='${Constants.FOLDER_NAME}' and trashed=false")
                .setSpaces(Constants.SPACE).setFields("files(id, name)").execute()

            result.files.firstOrNull()?.id
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun createFolder(drive: Drive): String? {
        return try {
            val fileMetadata = File()
            fileMetadata.name = Constants.FOLDER_NAME
            fileMetadata.mimeType = "application/vnd.google-apps.folder"

            val folder = drive.files().create(fileMetadata).setFields("id").execute()
            folder.id
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
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
                                    drive.files()[file.id].executeMediaAndDownloadTo(outputStream)
                                    val DriveBackupFile: DriveBackupFile = gson.fromJson(
                                        outputStream.toString(), DriveBackupFile::class.java
                                    )
                                    mnemonics.add(DriveBackupFile)
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
                    GoogleDriveManager.UNAUTHORIZED,
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
                    GoogleDriveManager.UNAUTHORIZED,
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
                getGoogleDrive(reactContext, true).let { (drive) ->
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
                    GoogleDriveManager.UNAUTHORIZED,
                    e
                )
            } catch (e: FileNotFoundException) {
                promise.reject(
                    "deleteBackupError",
                    GoogleDriveManager.FAILED_TO_LOCATE_WALLET,
                    e
                )
            } catch (e: Exception) {
                promise.reject(
                    "deleteBackupError",
                    GoogleDriveManager.FAILED_TO_DELETE_WALLET,
                    e
                )
            }
        }
    }

    fun getWallet(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext, true).let { (drive) ->
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
                                return@withContext
                            }
                        }

                        promise.resolve(null)
                    }
                }
            } catch (e: UserRecoverableAuthIOException) {
                reactContext.currentActivity?.startActivityForResult(
                    e.intent,
                    REQUEST_AUTHORIZATION
                )
                promise.reject(
                    "getWallet",
                    GoogleDriveManager.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("getWallet", GoogleDriveManager.FAILED_TO_GET_WALLET, e)
            }
        }
    }

    fun getSalt(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext, true).let { (drive) ->
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
                                        driveBackupFile.salt
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
                    GoogleDriveManager.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("getSalt", GoogleDriveManager.FAILED_TO_GET_SALT, e)
            }

        }
    }

    fun getIV(rootAddress: String, reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext, true).let { (drive) ->
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
                                        driveBackupFile.iv
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
                    GoogleDriveManager.UNAUTHORIZED,
                    e
                )
            } catch (e: Exception) {
                promise.reject("getIV", GoogleDriveManager.FAILED_TO_GET_IV, e)
            }
        }
    }

    fun googleAccountSignOut(promise: Promise) {
        try {
            googleSignInClient?.signOut()
            googleSignInClient = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("googleAccountSignOut", GoogleDriveManager.FAILED_GOOGLE_SIGN_OUT, e)
        }
    }
}