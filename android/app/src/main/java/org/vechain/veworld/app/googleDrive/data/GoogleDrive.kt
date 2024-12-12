package org.vechain.veworld.app.googleDrive.data

import android.content.Context
import android.content.Intent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.vechain.veworld.app.R
import java.nio.charset.StandardCharsets

class GoogleDrive(private val context: Context) {
    private object Constants {
        const val SPACE = "drive"
        const val FOLDER_NAME = "VeWorld"
        const val WALLET_ZONE = "WALLET_ZONE"
    }

    fun areGooglePlayServicesAvailable(): Boolean {
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(context)
        return resultCode == ConnectionResult.SUCCESS
    }

    fun getSignInClient(): GoogleSignInClient {
        val googleSignInOptions =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN).requestEmail()
                .requestScopes(
                    Scope(DriveScopes.DRIVE_FILE), Scope(DriveScopes.DRIVE_APPDATA)
                ).build()

        return GoogleSignIn.getClient(context, googleSignInOptions)
    }

    fun getSignInIntent(): Intent {
        val googleSignInClient = getSignInClient()
        return googleSignInClient.signInIntent
    }

    fun getAccountFromIntent(intent: Intent): GoogleSignInAccount {
        val signInTask = GoogleSignIn.getSignedInAccountFromIntent(intent)
        val account = signInTask.getResult(ApiException::class.java)
        return account
    }

    fun hasAccountAllRequiredPermissions(account: GoogleSignInAccount): Boolean {
        val hasPermissions = GoogleSignIn.hasPermissions(
            account,
            Scope(DriveScopes.DRIVE_FILE),
            Scope(DriveScopes.DRIVE_APPDATA)
        )
        return hasPermissions
    }

    fun getDriveFromAccount(account: GoogleSignInAccount): Drive {
        val credential = GoogleAccountCredential.usingOAuth2(
            context, listOf(DriveScopes.DRIVE_FILE, DriveScopes.DRIVE_APPDATA)
        )

        credential.selectedAccount = account.account!!

        val drive = Drive.Builder(
            NetHttpTransport(), GsonFactory.getDefaultInstance(), credential
        ).setApplicationName(context.getString(R.string.app_name)).build()
        return drive
    }

    suspend fun getFileIdByFileName(
        drive: Drive,
        name: String,
        folderId: String? = null,
    ): String? {
        val space = Constants.SPACE
        val fields = "nextPageToken, files(id, name)"
        val pageSize = 1

        val query = buildString {
            if (!folderId.isNullOrEmpty()) {
                append("'$folderId' in parents and ")
            }
            append("trashed=false and name='$name.json'")
        }

        var files: FileList

        withContext(Dispatchers.IO) {
            files = drive.files().list().setSpaces(space).setFields(fields)
                .setPageSize(pageSize)
                .setQ(query)
                .execute()
        }

        return files.files.firstOrNull()?.id
    }

    suspend fun getFilesByFolderId(drive: Drive, folderId: String): FileList {
        val allFiles = FileList()
        allFiles.files = mutableListOf()

        withContext(Dispatchers.IO) {
            var pageToken: String? = null

            do {
                val result =
                    drive.files().list()
                        .setSpaces("drive")
                        .setFields("nextPageToken, files(id, name)")
                        .setQ("'$folderId' in parents and trashed = false")
                        .setPageToken(pageToken).execute()

                result.files?.let {
                    allFiles.files.addAll(it)
                }

                pageToken = result.nextPageToken

            } while (pageToken != null)
        }

        return allFiles
    }

    suspend fun getFolderByName(
        drive: Drive,
        folderName: String? = Constants.FOLDER_NAME,
    ): String? {
        val query =
            "mimeType='application/vnd.google-apps.folder' and name='$folderName' and trashed=false"
        val space = Constants.SPACE
        val fields = "files(id, name)"

        var results: FileList

        withContext(Dispatchers.IO) {
            results = drive.files().list()
                .setQ(query)
                .setSpaces(space).setFields(fields).execute()
        }

        return results.files.firstOrNull()?.id
    }

    suspend fun createFolder(drive: Drive): String {
        val fileMetadata = File()
        fileMetadata.name = Constants.FOLDER_NAME
        fileMetadata.mimeType = "application/vnd.google-apps.folder"
        val fields = "id"
        var folder: File

        withContext(Dispatchers.IO) {
            folder = drive.files().create(fileMetadata).setFields(fields).execute()
        }

        return folder.id
    }

    suspend fun saveFileToCloud(drive: Drive, fileMetadata: File, jsonData: String) {
        val jsonByteArray = jsonData.toByteArray(StandardCharsets.UTF_8)
        val inputContent = ByteArrayContent("application/json", jsonByteArray)

        withContext(Dispatchers.IO) {
            drive.files().create(fileMetadata, inputContent).execute()
        }
    }

    suspend fun deleteFile(drive: Drive, fileId: String) {
        withContext(Dispatchers.IO) {
            drive.files().delete(fileId).execute()
        }
    }

    fun signOut() {
        val googleSignInClient = getSignInClient()
        googleSignInClient.signOut()
    }
}