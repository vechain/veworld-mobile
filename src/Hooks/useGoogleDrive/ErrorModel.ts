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
    DELETE_BACKUP,
    SIGN_OUT,
    UNKNOWN_TYPE,
    UNKNOWN_DERIVATION_PATH,
    ACTIVITY_NOT_FOUND,
} = GoogleDriveManager?.getConstants() ?? {}

export const handleGoogleDriveErrors = (err: GDError): { title: string; description: string } | null => {
    const locale = i18n.detectLocale()

    if (err) {
        error(ERROR_EVENTS.GOOGLE_DRIVE, err, err.message)
    }

    switch (err.code) {
        case OAUTH_INTERRUPTED:
            return null
        case DRIVE_CREATION:
            return {
                title: i18n.i18n()[locale].GOOGLE_DRIVE_GENERIC_ERROR_TITLE(),
                description: i18n.i18n()[locale].GOOGLE_DRIVE_ERR_NETWORK(),
            }

        case DELETE_BACKUP:
        case GET_BACKUP:
        case GET_ALL_BACKUPS:
        case FOLDER_NOT_FOUND:
        case GET_ACCOUNT:
            return {
                title: i18n.i18n()[locale].GOOGLE_DRIVE_GENERIC_ERROR_TITLE(),
                description: i18n.i18n()[locale].GOOGLE_DRIVE_ERR_WALLET_OPERATION(),
            }

        case PERMISSION_GRANTED:
        case USER_UNRECOVERABLE_AUTH:
            return {
                title: i18n.i18n()[locale].GOOGLE_DRIVE_GENERIC_ERROR_TITLE(),
                description: i18n.i18n()[locale].GOOGLE_DRIVE_ERR_UNAUTHORIZED(),
            }

        case GOOGLE_SERVICES_UNAVAILABLE:
            return {
                title: i18n.i18n()[locale].GOOGLE_DRIVE_GENERIC_ERROR_TITLE(),
                description: i18n.i18n()[locale].GOOGLE_DRIVE_ERR_GOOGLE_SERVICES(),
            }

        case ACTIVITY_NOT_FOUND:
        case SIGN_OUT:
        case UNKNOWN_TYPE:
        case UNKNOWN_DERIVATION_PATH:
        case CHECK_PERMISSIONS:
        case SIGN_IN_INTENT_CREATION:
        case SIGN_IN_INTENT_IS_NULL:
        default:
            return {
                title: i18n.i18n()[locale].GOOGLE_DRIVE_GENERIC_ERROR_TITLE(),
                description: i18n.i18n()[locale].GOOGLE_DRIVE_ERROR_GENERIC(),
            }
    }
}
