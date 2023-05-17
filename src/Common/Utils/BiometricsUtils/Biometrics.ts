import * as LocalAuthentication from "expo-local-authentication"
import { TAuthentication, SecurityLevelType } from "~Model"
import * as i18n from "~i18n"
import PlatformUtils from "../PlatformUtils"

export const getDeviceEnrolledLevel = async () => {
    let level = await LocalAuthentication.getEnrolledLevelAsync()
    return LocalAuthentication.SecurityLevel[level] as SecurityLevelType
}

export const getDeviceHasHardware = async () => {
    let hasHardware = await LocalAuthentication.hasHardwareAsync()
    return hasHardware
}

export const getIsDeviceEnrolled = async () => {
    let enrolled = await LocalAuthentication.isEnrolledAsync()
    return enrolled
}

export const getBiometricTypeAvailable = async () => {
    let type = await LocalAuthentication.supportedAuthenticationTypesAsync()
    // @ts-ignore // compiler misses enum for some reason
    return LocalAuthentication.AuthenticationType[type] as TAuthentication
}

export const authenticateWithBiometrics = async () => {
    const locale = i18n.detectLocale()
    const promptMessage = i18n.i18n()[locale].BIOMETRICS_PROMPT()
    const cancelLabel = i18n.i18n()[locale].COMMON_BTN_CANCEL()

    let isAuth: LocalAuthentication.LocalAuthenticationResult
    // if statement used this way because passing undefiend on iOS is breaking the authentication prompt
    if (PlatformUtils.isAndroid()) {
        isAuth = await LocalAuthentication.authenticateAsync({
            disableDeviceFallback: true,
            promptMessage,
            cancelLabel,
        })
    } else {
        isAuth = await LocalAuthentication.authenticateAsync({
            disableDeviceFallback: true,
            cancelLabel,
        })
    }

    return isAuth
}

export const isSecurityDowngrade = (
    oldLevel: string,
    newLevel: SecurityLevelType,
    appLockStatusActive: boolean,
) =>
    oldLevel === SecurityLevelType.BIOMETRICS &&
    newLevel !== SecurityLevelType.BIOMETRICS &&
    appLockStatusActive

export const isSecurityUpgrade = (
    oldLevel: string,
    newLevel: SecurityLevelType,
    appLockStatusActive: boolean,
) =>
    oldLevel !== SecurityLevelType.BIOMETRICS &&
    newLevel === SecurityLevelType.BIOMETRICS &&
    appLockStatusActive
