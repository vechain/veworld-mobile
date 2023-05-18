import { SecurityLevelType } from "./enum"

export type TAuthentication = "FINGERPRINT" | "FACIAL_RECOGNITION" | "IRIS"

export type BiometricState = {
    currentSecurityLevel: SecurityLevelType
    authTypeAvailable: TAuthentication
    isDeviceEnrolled: boolean
    isHardwareAvailable: boolean
    accessControl: boolean
}
