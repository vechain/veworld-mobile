package org.vechain.veworld.app.googleDrive

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.ByteArrayContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.api.services.drive.model.File
import com.google.api.services.drive.model.FileList
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.vechain.veworld.app.R
import java.io.ByteArrayOutputStream
import java.io.FileNotFoundException
import java.nio.charset.StandardCharsets
import java.util.Date

enum class Request(val value: Int) {
    GOOGLE_SIGN_IN(122)
}

object GDriveParams {
    const val SPACES = "appDataFolder"
    const val FIELDS = "nextPageToken, files(id, name)"
    const val PAGE_SIZE_NORMAL = 30
    const val PAGE_SIZE_SINGLE = 1
}

class GoogleDriveViewModel(private val gson: Gson = Gson()) : ViewModel() {
    fun test(promise: Promise) {
        viewModelScope.launch {
            delay(2000)
            promise.resolve("OK")
        }
    }

    private fun hasPermissionToGoogleDrive(reactContext: ReactApplicationContext): Boolean {
        val acc = GoogleSignIn.getLastSignedInAccount(reactContext)
        val hasPermissions =
            acc?.let { GoogleSignIn.hasPermissions(acc, Scope(DriveScopes.DRIVE_APPDATA)) }
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
            throw IllegalStateException("Activity cannot be null")
        }
    }

    private suspend fun getGoogleDrivePermissions(reactContext: ReactApplicationContext): GoogleSignInAccount? =
        suspendCancellableCoroutine { continuation ->
            try {
                val googleSignInClient = getGoogleSignInClient(reactContext)
                googleSignInClient.signOut() // Force a sign out so that we can reselect account
                val signInIntent = googleSignInClient.signInIntent
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
                            continuation.resumeWith(Result.failure(Exception("Oauth process has been interrupted")))
                            Log.d("Activity intent", "Indent null")
                        }
                    }

                    override fun onNewIntent(p0: Intent?) {}
                }

                reactContext.addActivityEventListener(listener)
            } catch (e: Exception) {
                Log.e("EXCEPTION", "${e.message}")
                continuation.resumeWith(
                    Result.failure(
                        Exception("Failed to get google drive account")
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

    private fun getFileIdByFileName(drive: Drive, name: String, folderId: String): String? {
        try {
            val files: FileList =
                drive.files().list().setSpaces("drive").setFields(GDriveParams.FIELDS)
                    .setPageSize(GDriveParams.PAGE_SIZE_SINGLE)
                    .setQ("'$folderId' in parents and and trashed=false and name = '$name.json'")
                    .execute()
            return files.files.firstOrNull()?.id
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return null
    }

    private fun getFolderById(drive: Drive, folderName: String): String? {
        return try {
            val result = drive.files().list()
                .setQ("mimeType='application/vnd.google-apps.folder' and name='$folderName' and trashed=false")
                .setSpaces("drive").setFields("files(id, name)").execute()

            result.files.firstOrNull()?.id
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun createFolder(drive: Drive, folderName: String): String? {
        return try {
            val fileMetadata = File()
            fileMetadata.name = folderName
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
        mnemonicId: String,
        backup: BackupFile,
    ) {
        val fileMetadata = File()
        fileMetadata.name = "$mnemonicId.json"

        val folderId = getFolderById(drive, "VeWorld") ?: createFolder(drive, "VeWorld")

        folderId?.let {
            fileMetadata.parents = listOf(it)

            val jsonData = gson.toJson(backup)
            val jsonByteArray = jsonData.toByteArray(StandardCharsets.UTF_8)
            val inputContent = ByteArrayContent("application/json", jsonByteArray)
            val fileId = getFileIdByFileName(drive, mnemonicId, folderId)
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
            val folderId = getFolderById(drive, "VeWorld")

            folderId?.let { id ->
                var pageToken: String? = null

                do {
                    val result =
                        drive.files().list().setSpaces("drive").setFields(GDriveParams.FIELDS)
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


    fun fetchMnemonicBackups(reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                val mnemonics = mutableListOf<BackupFile>()

                getGoogleDrive(reactContext).let { (drive) ->
                    if (drive == null) return@launch
                    fetchCloudBackupFiles(drive).let { files ->
                        withContext(Dispatchers.IO) {
                            files.files.forEach { file ->
                                launch {
                                    val outputStream = ByteArrayOutputStream()
                                    drive.files()[file.id].executeMediaAndDownloadTo(outputStream)
                                    val backupFile: BackupFile = gson.fromJson(
                                        outputStream.toString(), BackupFile::class.java
                                    )
                                    mnemonics.add(backupFile)
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
            } catch (e: Exception) {
                promise.reject("cloudError", "Failed to fetch cloud backups, ${e.message}")
            }
        }
    }

    fun backupMnemonicToCloud(reactContext: ReactApplicationContext, promise: Promise) {
        viewModelScope.launch {
            try {
                getGoogleDrive(reactContext).let { (drive, acc) ->
                    if (drive == null) return@launch
                    val createdAt = Date().time / 1000.0

                    val backup = BackupFile(
                        "Name", "Content", createdAt
                    )

                    withContext(Dispatchers.IO) {
                        saveMnemonicToGoogleDrive(drive, "1", backup)
                    }

                    // sendFoundBackupEvent(mnemonicId, createdAt.toString(), acc?.email)
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(
                    "backupEncryptionError",
                    "Failed to encrypt mnemonics: ${e.message}",
                    e,
                )
            }
        }
    }

    @ReactMethod
    fun deleteCloudStorageMnemonicBackup(
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
                        val folderId = getFolderById(drive, "VeWorld")

                        folderId?.let { id ->
                            val fileId = getFileIdByFileName(drive, "1", folderId)
                            if (fileId != null) {
                                drive.files().delete(fileId).execute()
                            }
                        }
                    }
                }
                promise.resolve(true)
            } catch (e: FileNotFoundException) {
                Log.e("EXCEPTION", "${e.message}")
                promise.reject(
                    "deleteBackupError",
                    "Failed to locate backup"
                )
            } catch (e: Exception) {
                Log.e("EXCEPTION", "${e.message}")
                promise.reject(
                    "deleteBackupError",
                    "Failed to delete backup"
                )
            }
        }
    }
}