import * as LocalAuthentication from "expo-local-authentication"
import { TAuthentication, SecurityLevelType } from "~Model"
import * as i18n from "~i18n"
import PlatformUtils from "../PlatformUtils"
import * as BiometricErrors from "./BiometricErrors"
export { BiometricErrors }

export const getDeviceEnrolledLevel = async () => {
    const level = await LocalAuthentication.getEnrolledLevelAsync()
    // In newer version of local auth BIOMETRIC type is deprecated so
    // I'm remapping it to keep the code linear
    if (
        level === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK ||
        level === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
    )
        return SecurityLevelType.BIOMETRIC

    return LocalAuthentication.SecurityLevel[level] as SecurityLevelType
}

export const getDeviceHasHardware = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    return hasHardware
}

export const getIsDeviceEnrolled = async () => {
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return enrolled
}

export const getBiometricTypeAvailable = async () => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    const type = types[0]
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

export const isSecurityDowngrade = (oldLevel: string, newLevel: SecurityLevelType, appLockStatusActive: boolean) =>
    oldLevel === SecurityLevelType.BIOMETRIC && newLevel !== SecurityLevelType.BIOMETRIC && appLockStatusActive

export const isSecurityUpgrade = (oldLevel: string, newLevel: SecurityLevelType, appLockStatusActive: boolean) =>
    oldLevel !== SecurityLevelType.BIOMETRIC && newLevel === SecurityLevelType.BIOMETRIC && appLockStatusActive
