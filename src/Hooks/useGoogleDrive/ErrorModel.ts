export type GDError = {
    code: string
    domain: string
    message: string
}

import { NativeModules } from "react-native"
import { ERROR_EVENTS } from "~Constants"
import * as i18n from "~i18n"
import { error } from "~Utils"
const { GoogleDriveManager } = NativeModules
const {
    SIGN_IN_INTENT_CREATION,
    GOOGLE_SERVICES_UNAVAILABLE,
    SIGN_IN_INTENT_IS_NULL,
    GET_ACCOUNT,
    CHECK_PERMISSIONS,
    PERMISSION_GRANTED,
    DRIVE_CREATION,
    OAUTH_INTERRUPTED,
    FOLDER_NOT_FOUND,
    GET_ALL_BACKUPS,
    USER_UNRECOVERABLE_AUTH,
    GET_BACKUP,
    BACKUP_NOT_FOUND,
    DELETE_BACKUP,
    SIGN_OUT,
    UNKNOWN_TYPE,
    UNKNOWN_DERIVATION_PATH,
    ACTIVITY_NOT_FOUND,
} = GoogleDriveManager?.getConstants() ?? {}

export const handleGoogleDriveErrors = (err: GDError) => {
    const locale = i18n.detectLocale()

    if (err) {
        error(ERROR_EVENTS.GOOGLE_DRIVE, err)
    }

    switch (err.code) {
        case DRIVE_CREATION:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_NETWORK()

        case BACKUP_NOT_FOUND:
        case DELETE_BACKUP:
        case GET_BACKUP:
        case GET_ALL_BACKUPS:
        case FOLDER_NOT_FOUND:
        case GET_ACCOUNT:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_WALLET_OPERATION()

        case PERMISSION_GRANTED:
        case USER_UNRECOVERABLE_AUTH:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_UNAUTHORIZED()

        case ACTIVITY_NOT_FOUND:
        case OAUTH_INTERRUPTED:
        case SIGN_OUT:
        case UNKNOWN_TYPE:
        case UNKNOWN_DERIVATION_PATH:
        case CHECK_PERMISSIONS:
        case SIGN_IN_INTENT_CREATION:
        case SIGN_IN_INTENT_IS_NULL:
        case GOOGLE_SERVICES_UNAVAILABLE:
        default:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERROR_GENERIC()
    }
}

export const isCancelError = (message: string) => {
    return message === OAUTH_INTERRUPTED
}
