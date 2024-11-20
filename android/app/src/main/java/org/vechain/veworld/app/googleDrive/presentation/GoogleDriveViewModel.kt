package org.vechain.veworld.app.googleDrive.presentation

import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException
import com.google.api.services.drive.Drive
import com.google.api.services.drive.model.File
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.vechain.veworld.app.googleDrive.Constants
import org.vechain.veworld.app.googleDrive.data.GoogleDrive
import org.vechain.veworld.app.googleDrive.domain.DerivationPath
import org.vechain.veworld.app.googleDrive.domain.DerivationPathDeserializer
import org.vechain.veworld.app.googleDrive.domain.DerivationPathSerializer
import org.vechain.veworld.app.googleDrive.domain.DeviceType
import org.vechain.veworld.app.googleDrive.domain.DeviceTypeDeserializer
import org.vechain.veworld.app.googleDrive.domain.DeviceTypeSerializer
import org.vechain.veworld.app.googleDrive.domain.DriveBackupFile
import org.vechain.veworld.app.googleDrive.domain.IVDeserializer
import org.vechain.veworld.app.googleDrive.domain.IVSerializer
import org.vechain.veworld.app.googleDrive.domain.Iv
import org.vechain.veworld.app.googleDrive.domain.Salt
import org.vechain.veworld.app.googleDrive.domain.SaltDeserializer
import org.vechain.veworld.app.googleDrive.domain.SaltSerializer
import org.vechain.veworld.app.googleDrive.util.DataError
import org.vechain.veworld.app.googleDrive.util.EmptyResult
import org.vechain.veworld.app.googleDrive.util.Result
import org.vechain.veworld.app.googleDrive.util.asEmptyDataResult
import java.io.ByteArrayOutputStream

class GoogleDriveViewModel(private val googleDrive: GoogleDrive) : ViewModel() {
    private val gson: Gson = GsonBuilder()
        .registerTypeAdapter(DeviceType::class.java, DeviceTypeDeserializer())
        .registerTypeAdapter(DeviceType::class.java, DeviceTypeSerializer())
        .registerTypeAdapter(DerivationPath::class.java, DerivationPathDeserializer())
        .registerTypeAdapter(DerivationPath::class.java, DerivationPathSerializer())
        .registerTypeAdapter(Salt::class.java, SaltDeserializer())
        .registerTypeAdapter(Salt::class.java, SaltSerializer())
        .registerTypeAdapter(Iv::class.java, IVDeserializer())
        .registerTypeAdapter(Iv::class.java, IVSerializer())
        .create()

    private fun getAccountFromIntent(intent: Intent?): Result<GoogleSignInAccount, DataError.Drive> {
        return try {
            if (!googleDrive.areGooglePlayServicesAvailable()) {
                return Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE)
            }

            intent?.let {
                Result.Success(googleDrive.getAccountFromIntent(intent))
            } ?: Result.Error(DataError.Drive.SIGN_IN_INTENT_IS_NULL)
        } catch (e: Exception) {
            Result.Error(DataError.Drive.GET_ACCOUNT, e)
        }
    }

    private fun hasAccountAllPermissions(account: GoogleSignInAccount): Result<Boolean, DataError.Drive> {
        return try {
            Result.Success(googleDrive.hasAccountAllRequiredPermissions(account))
        } catch (e: Exception) {
            Result.Error(DataError.Drive.CHECK_PERMISSIONS, e)
        }
    }

    fun areGoogleServicesAvailable(): Boolean {
        return googleDrive.areGooglePlayServicesAvailable()
    }

    fun getSignInIntent(): Result<Intent, DataError.Drive> {
        return try {
            if (!googleDrive.areGooglePlayServicesAvailable()) {
                Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE)
            } else {
                Result.Success(googleDrive.getSignInIntent())
            }
        } catch (e: Exception) {
            Result.Error(DataError.Drive.SIGN_IN_INTENT_CREATION, e)
        }
    }

    fun getDrive(intent: Intent?): Result<Drive, DataError.Drive> {
        if (!googleDrive.areGooglePlayServicesAvailable()) {
            return Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE)
        }

        val account =
            when (val accountResult = getAccountFromIntent(intent)) {
                is Result.Success -> accountResult.data
                is Result.Error -> return accountResult
            }

        val hasPermissions = when (val hasPermissionsResult = hasAccountAllPermissions(account)) {
            is Result.Success -> hasPermissionsResult.data
            is Result.Error -> return hasPermissionsResult
        }

        return if (hasPermissions) {
            try {
                Result.Success(googleDrive.getDriveFromAccount(account))
            } catch (e: Exception) {
                Result.Error(DataError.Drive.DRIVE_CREATION, e)
            }
        } else {
            Result.Error(DataError.Drive.PERMISSION_GRANTED)
        }
    }

    fun getAllBackups(
        drive: Drive,
        onResult: (Result<List<DriveBackupFile>, DataError.Drive>) -> Unit,
    ) {
        if (!googleDrive.areGooglePlayServicesAvailable()) {
            onResult(Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE))
        }

        viewModelScope.launch {
            try {
                val folderId = googleDrive.getFolderByName(drive)

                folderId?.let { id ->
                    val allFiles = googleDrive.getFilesByFolderId(drive, id)
                    val mnemonics = mutableListOf<DriveBackupFile>()

                    withContext(Dispatchers.IO) {
                        allFiles.files.forEach { file ->
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
                    onResult(Result.Success(mnemonics))
                } ?: {
                    googleDrive.signOut()
                    onResult(Result.Error(DataError.Drive.FOLDER_NOT_FOUND))
                }
            } catch (e: UserRecoverableAuthIOException) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.USER_UNRECOVERABLE_AUTH))
            } catch (e: Exception) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.GET_ALL_BACKUPS, e))
            }
        }
    }

    fun getBackup(
        drive: Drive,
        fileName: String,
        onResult: (Result<DriveBackupFile, DataError.Drive>) -> Unit,
    ) {
        if (!googleDrive.areGooglePlayServicesAvailable()) {
            return onResult(Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE))
        }

        viewModelScope.launch {
            try {
                val folderId = googleDrive.getFolderByName(drive)

                folderId?.let {
                    val fileId = googleDrive.getFileIdByFileName(drive, fileName, folderId)

                    fileId?.let {
                        withContext(Dispatchers.IO) {
                            val outputStream = ByteArrayOutputStream()
                            drive.files()[fileId].executeMediaAndDownloadTo(outputStream)
                            val backup: DriveBackupFile = gson.fromJson(
                                outputStream.toString(), DriveBackupFile::class.java
                            )
                            onResult(Result.Success(backup))
                        }
                    } ?: onResult(Result.Error(DataError.Drive.BACKUP_NOT_FOUND))
                } ?: onResult(Result.Error(DataError.Drive.FOLDER_NOT_FOUND))
            } catch (e: UserRecoverableAuthIOException) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.USER_UNRECOVERABLE_AUTH))
            } catch (e: Exception) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.GET_BACKUP, e))
            }
        }
    }

    fun deleteBackup(
        drive: Drive,
        fileName: String,
        onResult: (EmptyResult<DataError.Drive>) -> Unit,
    ) {
        if (!googleDrive.areGooglePlayServicesAvailable()) {
            return onResult(Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE))
        }

        viewModelScope.launch {
            try {
                val folderId = googleDrive.getFolderByName(drive)

                folderId?.let {
                    val fileId = googleDrive.getFileIdByFileName(drive, fileName, folderId)

                    fileId?.let {
                        withContext(Dispatchers.IO) {
                            googleDrive.deleteFile(drive, fileId)
                            onResult(Result.Success(null).asEmptyDataResult())
                        }
                    } ?: onResult(Result.Error(DataError.Drive.BACKUP_NOT_FOUND))
                } ?: onResult(Result.Error(DataError.Drive.FOLDER_NOT_FOUND))
            } catch (e: UserRecoverableAuthIOException) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.USER_UNRECOVERABLE_AUTH))
            } catch (e: Exception) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.DELETE_BACKUP, e))
            }
        }
    }

    fun saveBackup(
        drive: Drive,
        driveBackupFile: DriveBackupFile,
        onResult: (EmptyResult<DataError.Drive>) -> Unit,
    ) {
        if (!googleDrive.areGooglePlayServicesAvailable()) {
            return onResult(Result.Error(DataError.Drive.GOOGLE_SERVICES_UNAVAILABLE))
        }

        viewModelScope.launch {
            try {
                val fileMetadata = File()
                fileMetadata.name = "${Constants.WALLET_ZONE}_${driveBackupFile.rootAddress}.json"
                val folderId = googleDrive.getFolderByName(drive) ?: googleDrive.createFolder(drive)
                fileMetadata.parents = listOf(folderId)
                val jsonData = gson.toJson(driveBackupFile)
                val fileId = googleDrive.getFileIdByFileName(drive, fileMetadata.name, folderId)
                fileId?.let { googleDrive.deleteFile(drive, it) }
                googleDrive.saveFileToCloud(drive, fileMetadata, jsonData)
                onResult(Result.Success(null).asEmptyDataResult())
            } catch (e: UserRecoverableAuthIOException) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.USER_UNRECOVERABLE_AUTH))
            } catch (e: Exception) {
                googleDrive.signOut()
                onResult(Result.Error(DataError.Drive.DELETE_BACKUP, e))
            }
        }
    }

    fun signOut(): EmptyResult<DataError.Drive> {
        return try {
            googleDrive.signOut()
            Result.Success(null).asEmptyDataResult()
        } catch (e: Exception) {
            Result.Error(DataError.Drive.SIGN_OUT, e)
        }
    }
}