import { Object } from "realm"

export class Biometrics extends Object<Biometrics> {
    _id = "BIOMETRICS"
    currentSecurityLevel?: "NONE" | "SECRET" | "BIOMETRIC"
    authtypeAvailable?: "FINGERPRINT" | "FACIAL_RECOGNITION" | "IRIS"
    isDeviceEnrolled?: boolean
    isHardwareAvailable?: boolean
    accessControl?: boolean

    static primaryKey = "_id"
}
