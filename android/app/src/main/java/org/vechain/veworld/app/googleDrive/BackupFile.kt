package org.vechain.veworld.app.googleDrive

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

data class BackupFile(
    val rootAddress: String,
    val data: String,
    val walletType: String,
    val firstAccountAddress: String,
    val derivationPath: String,
    val salt: String,
    val iv: String,
    val creationDate: Double
) {
    fun toWritableMap(): WritableMap {
        return WritableNativeMap().apply {
            putString("rootAddress", rootAddress)
            putString("data", data)
            putString("walletType", walletType)
            putString("firstAccountAddress", firstAccountAddress)
            putString("derivationPath", derivationPath)
            putString("salt", salt)
            putString("iv", iv)
            putDouble("creationDate", creationDate)
        }
    }
}
