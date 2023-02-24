export type TAuthentication = "FINGERPRINT" | "FACIAL_RECOGNITION" | "IRIS"
export type TSecurityLevel = "NONE" | "SECRET" | "BIOMETRIC"

export type BiometricState = {
    currentSecurityLevel: TSecurityLevel
    authtypeAvailable: TAuthentication
    isDeviceEnrolled: boolean
    isHardwareAvailable: boolean
    accessControl: boolean
}
