import * as LocalAuthentication from "expo-local-authentication"

export const getDeviceEnrolledLevel = async () => {
    let level = await LocalAuthentication.getEnrolledLevelAsync()
    return LocalAuthentication.SecurityLevel[level]
}

export const getGeviceHasHardware = async () => {
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
    return LocalAuthentication.AuthenticationType[type]
}

export const authenticateWithbiometric = async () => {
    let isAuth = await LocalAuthentication.authenticateAsync()
    return isAuth
}
