package org.vechain.veworld.app.googleDrive

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

data class BackupFile(
    val name: String,
    val content: String,
    val createdAt: Double
) {
    fun toWritableMap(): WritableMap {
        return WritableNativeMap().apply {
            putString("name", name)
            putString("content", content)
            putDouble("createdAt", createdAt)
        }
    }
}
