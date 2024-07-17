package org.vechain.veworld.app.drivemanager

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

data class Wallet (
    val ROOT_ADDRESS: String,
    val WALLET_TYPE: String,
    val FIRST_ACCOUNT_ADDRESS: String,
    val CREATION_DATE: String,
    val DATA: String,
    val SALT: String,
) {
    fun mapToReadableWallet(): WritableMap {
        val readableWallet = Arguments.createMap().apply {
            putString("ROOT_ADDRESS", ROOT_ADDRESS)
            putString("WALLET_TYPE", WALLET_TYPE)
            putString("FIRST_ACCOUNT_ADDRESS", FIRST_ACCOUNT_ADDRESS)
            putString("CREATION_DATE", CREATION_DATE)
            putString("DATA", DATA)
            putString("SALT", SALT)
        }
        return readableWallet
    }
}