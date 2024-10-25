export type GDError = {
    code: string
    domain: string
    message: string
}

import { ERROR_EVENTS } from "~Constants"
import * as i18n from "~i18n"
import { error } from "~Utils"

const ACTIVITY_NULL = "Activity cannot be null"
export const OAUTH_INTERRUPTED = "Oauth process has been interrupted"
const FAILED_TO_GET_DRIVE = "Failed to get google drive account"
const FAILED_TO_LOCATE_WALLET = "Failed to locate wallet"
const FAILED_TO_DELETE_WALLET = "Failed to delete wallet"
const FAILED_TO_GET_WALLET = "Failed to retrieve wallet"
const FAILED_TO_GET_SALT = "Failed to retrieve salt"
const FAILED_TO_GET_IV = "Failed to retrieve IV"
const FAILED_GOOGLE_SIGN_OUT = "Failed to Sign out from Google Account"
const UNAUTHORIZED = "Action not permitted"

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

        case UNAUTHORIZED:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERR_UNAUTHORIZED()

        case ACTIVITY_NULL:
        case OAUTH_INTERRUPTED:
        case FAILED_GOOGLE_SIGN_OUT:
        default:
            return i18n.i18n()[locale].GOOGLE_DRIVE_ERROR_GENERIC()
    }
}
