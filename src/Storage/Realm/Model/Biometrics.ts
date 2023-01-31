import { Object } from "realm"

export class Biometrics extends Object<Biometrics> {
    _id = "BIOMETRICS"
    currentSecurityLevel = "BIOMETRIC"
    authtypeAvailable = "FACIAL_RECOGNITION"
    isDeviceEnrolled = true
    isHardwareAvailable = true
    accessControl = true

    static primaryKey = "_id"
}
