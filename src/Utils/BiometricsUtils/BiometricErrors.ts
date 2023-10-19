import { PlatformUtils, debug } from "~Utils"

const BiometricCancelErrors = {
    IOS_CANCEL: "-128",
    ANDROID_CANCEL: "13",
    ANDROID_BACK_CANCEL: "10",
}
const BiometricTooManyAttemptsErrors = {
    ANDROID_TOO_MANY_ATTEMPTS: "7",
    ANDROID_DISSABLED_SENSOR: "9",
}

Object.freeze(BiometricCancelErrors)
Object.freeze(BiometricTooManyAttemptsErrors)

export const isBiometricCanceled = (error: unknown) => {
    const errors = Object.values(BiometricCancelErrors)

    if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        getPlatformError(error as Record<"code", unknown>, errors)
    ) {
        debug("User Cancelled Biometric Operation")
        return true
    }

    return false
}

export const isBiometricTooManyAttempts = (error: unknown) => {
    const errors = Object.values(BiometricTooManyAttemptsErrors)

    if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        getPlatformError(error as Record<"code", unknown>, errors)
    ) {
        debug("User Failed Biometric AUthentication Too Many Times")
        return true
    }

    return false
}

const getPlatformError = (
    error: object & Record<"code", unknown>,
    errors: string[],
) => {
    if (PlatformUtils.isIOS()) {
        return errors.some(err => String(error.code).includes(err))
    }

    if (PlatformUtils.isAndroid()) {
        return errors.some(err => String(error).includes(err))
    }
}
