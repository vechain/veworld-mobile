export type GDError = {
    code: string
    domain: string
    message: string
}

import { ERROR_EVENTS } from "~Constants"
import * as i18n from "~i18n"
import { error } from "~Utils"
import { NativeModules } from "react-native"

const {
    ACTIVITY_NULL,
    OAUTH_INTERRUPTED,
    FAILED_TO_GET_DRIVE,
    FAILED_TO_LOCATE_WALLET,
    FAILED_TO_DELETE_WALLET,
    FAILED_TO_GET_WALLET,
    FAILED_TO_GET_SALT,
    FAILED_TO_GET_IV,
} = NativeModules.GoogleDriveManager.getConstants()

export const handleGoogleDriveErrors = (err: GDError) => {
    const locale = i18n.detectLocale()

    if (err) {
        error(ERROR_EVENTS.GOOGLE_DRIVE, err, err.message)
    }

    switch (err.message) {
        case FAILED_TO_GET_DRIVE:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_NETWORK()

        case FAILED_TO_LOCATE_WALLET:
        case FAILED_TO_DELETE_WALLET:
        case FAILED_TO_GET_WALLET:
        case FAILED_TO_GET_SALT:
        case FAILED_TO_GET_IV:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_WALLET_OPERATION()

        case ACTIVITY_NULL:
        case OAUTH_INTERRUPTED:
        default:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERROR_GENERIC()
    }
}
