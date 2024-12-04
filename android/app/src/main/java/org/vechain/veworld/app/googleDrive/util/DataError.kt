package org.vechain.veworld.app.googleDrive.util

sealed interface DataError : Error {
    enum class Drive(val code: String, name: String) : DataError {
        SIGN_IN_INTENT_CREATION("1001", "SIGN_IN_INTENT_CREATION"),
        GOOGLE_SERVICES_UNAVAILABLE("1002", "GOOGLE_SERVICES_UNAVAILABLE"),
        SIGN_IN_INTENT_IS_NULL("1003", "SIGN_IN_INTENT_IS_NULL"),
        GET_ACCOUNT("1004", "GET_ACCOUNT"),
        CHECK_PERMISSIONS("1005", "CHECK_PERMISSIONS"),
        PERMISSION_GRANTED("1006","PERMISSION_GRANTED"),
        DRIVE_CREATION("1007", "DRIVE_CREATION"),
        OAUTH_INTERRUPTED("1008", "OAUTH_INTERRUPTED"),
        FOLDER_NOT_FOUND("1009", "FOLDER_NOT_FOUND"),
        GET_ALL_BACKUPS("1010", "GET_ALL_WALLETS"),
        USER_UNRECOVERABLE_AUTH("1011", "USER_UNRECOVERABLE_AUTH"),
        GET_BACKUP("1012", "GET_BACKUP"),
        BACKUP_NOT_FOUND("1013", "BACKUP_NOT_FOUND"),
        DELETE_BACKUP("1014", "DELETE_BACKUP"),
        SIGN_OUT("1015", "SIGN_OUT"),
    }

    enum class Device(val code: String, name: String) : DataError {
        UNKNOWN_TYPE("2001", "UNKNOWN_TYPE"),
        UNKNOWN_DERIVATION_PATH("2002", "UNKNOWN_DERIVATION_PATH")
    }

    enum class Android(val code: String, name: String) : DataError {
        ACTIVITY_NOT_FOUND("3001", "ACTIVITY_NOT_FOUND")
    }
}