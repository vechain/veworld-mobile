import * as LocalAuthentication from "expo-local-authentication"

export const Biometrics = {
    getDeviceEnrolledLevel: async () => {
        let level = await LocalAuthentication.getEnrolledLevelAsync()
        return LocalAuthentication.SecurityLevel[level]
    },

    getGeviceHasHardware: async () => {
        let hasHardware = await LocalAuthentication.hasHardwareAsync()
        return hasHardware
    },

    getIsDeviceEnrolled: async () => {
        let enrolled = await LocalAuthentication.isEnrolledAsync()
        return enrolled
    },

    getBiometricTypeAvailable: async () => {
        let type = await LocalAuthentication.supportedAuthenticationTypesAsync()
        // @ts-ignore // compiler misses enum for some reason
        return LocalAuthentication.AuthenticationType[type]
    },

    authenticateWithbiometric: async () => {
        let isAuth = await LocalAuthentication.authenticateAsync()
        return isAuth
    },
}
