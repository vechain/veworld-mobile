package org.vechain.veworld.app.drivemanager

import android.app.Activity
import android.app.Activity.RESULT_OK
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.ReactApplicationContext
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.vechain.veworld.app.R
import java.nio.charset.StandardCharsets

object GDriveParams {
    const val SPACES = "appDataFolder"
    const val FIELDS = "nextPageToken, files(id, name)"
    const val PAGE_SIZE_NORMAL = 30
    const val PAGE_SIZE_SINGLE = 1
}

class DriveServiceHelper {
    companion object {
        const val REQUEST_CODE_SIGN_IN = 1
        private val gson = Gson()

        private fun getGoogleSignInClient(reactContext: ReactApplicationContext): GoogleSignInClient {
            val activity = reactContext.currentActivity

            if (activity != null) {
                val options = GoogleSignInOptions.Builder(
                    GoogleSignInOptions.DEFAULT_SIGN_IN,
                ).requestEmail()
                    .requestScopes(Scope(DriveScopes.DRIVE_FILE))
                    .build()

                return GoogleSignIn.getClient(activity, options)
            } else {
                throw IllegalStateException("Activity cannot be null")
            }
        }


        private fun hasPermissionToGoogleDrive(reactContext: ReactApplicationContext): Boolean {
            val acc = GoogleSignIn.getLastSignedInAccount(reactContext)
            val hasPermissions =
                acc?.let { GoogleSignIn.hasPermissions(acc, Scope(DriveScopes.DRIVE_APPDATA)) }
            return hasPermissions == true
        }

        private suspend fun getGoogleDrivePermissions(reactContext: ReactApplicationContext): GoogleSignInAccount? =
            suspendCancellableCoroutine { continuation ->
                try {
                    val googleSignInClient = getGoogleSignInClient(reactContext)
                    googleSignInClient.signOut()

                    reactContext.currentActivity?.startActivityForResult(
                        googleSignInClient.signInIntent,
                        REQUEST_CODE_SIGN_IN
                    )

                    val activityEventListener = object : BaseActivityEventListener() {
                        override fun onActivityResult(
                            activity: Activity?,
                            requestCode: Int,
                            resultCode: Int,
                            intent: Intent?,
                        ) {
                            reactContext.removeActivityEventListener(this)
                            if (requestCode == REQUEST_CODE_SIGN_IN && resultCode == RESULT_OK && intent != null) {
                                val signInTask =
                                    GoogleSignIn.getSignedInAccountFromIntent(intent)
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

                    reactContext.addActivityEventListener(activityEventListener)
                } catch (e: Exception) {
                    continuation.resumeWith(
                        Result.failure(
                            Exception("Failed to get google drive account")
                        )
                    )
                }
            }


        suspend fun getGoogleDrive(reactContext: ReactApplicationContext): Pair<Drive?, GoogleSignInAccount?> {
            return withContext(Dispatchers.IO) {
                val account =
                    if (hasPermissionToGoogleDrive(reactContext)) GoogleSignIn.getLastSignedInAccount(
                        reactContext
                    ) else getGoogleDrivePermissions(reactContext)

                val drive = account?.let {
                    val credential =
                        GoogleAccountCredential.usingOAuth2(
                            reactContext,
                            listOf(DriveScopes.DRIVE_APPDATA)
                        )
                    credential.selectedAccount = account.account!!

                    Drive.Builder(
                        NetHttpTransport(),
                        GsonFactory.getDefaultInstance(),
                        credential
                    )
                        .setApplicationName(reactContext.getString(R.string.app_name))
                        .build()
                }

                Pair(drive, account)
            }
        }

        suspend fun fetchCloudBackupFiles(
            drive: Drive,
        ): FileList {
            return withContext(Dispatchers.IO) {
                val files: FileList = drive.files().list()
                    .setSpaces(GDriveParams.SPACES)
                    .setFields(GDriveParams.FIELDS)
                    .setPageSize(GDriveParams.PAGE_SIZE_NORMAL)
                    .execute()

                files
            }
        }

        suspend fun getFileIdByFileName(drive: Drive, name: String): File? {
            return withContext(Dispatchers.IO) {
                try {
                    val files: FileList = drive.files().list()
                        .setSpaces(GDriveParams.SPACES)
                        .setFields(GDriveParams.FIELDS)
                        .setPageSize(GDriveParams.PAGE_SIZE_SINGLE)
                        .setQ("name = '$name.json'")
                        .execute()

                    files.files.firstOrNull()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                null
            }
        }

        suspend fun saveMnemonicToGoogleDrive(
            drive: Drive,
            wallet: Wallet,
        ) {
            val fileMetadata = File()
            fileMetadata.name = "${wallet.ROOT_ADDRESS}.json"
            fileMetadata.parents = listOf("appDataFolder")
            val jsonData = gson.toJson(wallet)
            val jsonByteArray = jsonData.toByteArray(StandardCharsets.UTF_8)
            val inputContent = ByteArrayContent("application/json", jsonByteArray)
            val file = getFileIdByFileName(drive, wallet.ROOT_ADDRESS)
            if (file != null) {
                drive.files().delete(file.id).execute()
            }
            drive.files().create(fileMetadata, inputContent)
                .execute()
        }
    }
}