import { Object } from "realm"

export class Biometrics extends Object {
    _id!: string
    currentSecurityLevel!: string
    authtypeAvailable!: string
    isDeviceEnrolled!: boolean
    isHardwareAvailable!: boolean
    accessControl!: boolean

    static getName(): string {
        return Biometrics.schema.name
    }

    static PrimaryKey(): string {
        return Biometrics.schema.primaryKey
    }

    static schema = {
        name: "Biometrics",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "BIOMETRICS" },
            currentSecurityLevel: { type: "string", default: "BIOMETRIC" },
            authtypeAvailable: {
                type: "string",
                default: "FACIAL_RECOGNITION",
            },
            isDeviceEnrolled: { type: "bool", default: true },
            isHardwareAvailable: { type: "bool", default: true },
            accessControl: { type: "bool", default: true },
        },
    }
}
