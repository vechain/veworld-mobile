import * as LocalAuthentication from "expo-local-authentication"
import { TSecurityLevel, TAuthentication, SecurityLevelType } from "~Model"

export const getDeviceEnrolledLevel = async () => {
    let level = await LocalAuthentication.getEnrolledLevelAsync()
    return LocalAuthentication.SecurityLevel[level] as TSecurityLevel
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

export const authenticateWithbiometric = async () => {
    let isAuth = await LocalAuthentication.authenticateAsync()
    return isAuth
}

export const isSecurityDowngrade = (
    oldLevel: string,
    newLevel: TSecurityLevel,
) =>
    oldLevel === SecurityLevelType.BIOMETRIC &&
    newLevel !== SecurityLevelType.BIOMETRIC

export const isSecurityUpgrade = (oldLevel: string, newLevel: TSecurityLevel) =>
    oldLevel !== SecurityLevelType.BIOMETRIC &&
    newLevel === SecurityLevelType.BIOMETRIC
