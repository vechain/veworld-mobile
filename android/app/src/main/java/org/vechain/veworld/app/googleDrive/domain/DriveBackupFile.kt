package org.vechain.veworld.app.googleDrive.domain

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

data class DriveBackupFile(
    val rootAddress: String,
    val data: String,
    val walletType: DeviceType,
    val firstAccountAddress: String,
    val derivationPath: DerivationPath,
    val salt: Salt,
    val iv: Iv,
    val creationDate: Double
) {
    fun toWritableMap(): WritableMap {
        return WritableNativeMap().apply {
            putString("rootAddress", rootAddress)
            putString("data", data)
            putString("walletType", walletType.value)
            putString("firstAccountAddress", firstAccountAddress)
            putString("derivationPath", derivationPath.value)
            putString("salt", salt.value)
            putString("iv", iv.value)
            putDouble("creationDate", creationDate)
        }
    }
}
