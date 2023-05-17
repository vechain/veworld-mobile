import { SecurityLevelType } from "./enum"

export type TAuthentication = "FINGERPRINT" | "FACIAL_RECOGNITION" | "IRIS"

export type BiometricState = {
    currentSecurityLevel: SecurityLevelType
    authtypeAvailable: TAuthentication
    isDeviceEnrolled: boolean
    isHardwareAvailable: boolean
    accessControl: boolean
}
