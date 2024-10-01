export type GDError = {
    code: string
    domain: string
    message: string
}

import { ERROR_EVENTS } from "~Constants"
import * as i18n from "~i18n"
import { error } from "~Utils"

export const handleGoogleDriveErrors = (err: GDError) => {
    const locale = i18n.detectLocale()

    if (err) {
        error(ERROR_EVENTS.GOOGLE_DRIVE, err, err.message)
    }

    // Default error message - Generic
    return i18n.i18n()[locale].GOOGLE_DRIVE_ERROR_GENERIC()
}
