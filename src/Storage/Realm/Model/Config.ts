import { Object } from "realm"

export class Config extends Object {
    _id!: string
    isEncryptionKeyCreated!: boolean
    isWalletCreated!: boolean
    userSelectedSecurtiy!: string
    isAppLockActive!: boolean
    lastSecurityLevel!: string
    isSecurityDowngrade!: boolean

    static getName(): string {
        return Config.schema.name
    }

    static PrimaryKey(): string {
        return Config.schema.primaryKey
    }

    static schema = {
        name: "Config",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "APP_CONFIG" },
            isEncryptionKeyCreated: { type: "bool", default: false },
            isWalletCreated: { type: "bool", default: false },
            userSelectedSecurtiy: { type: "string", default: "NONE" },
            isAppLockActive: { type: "bool", default: true },
            lastSecurityLevel: { type: "string", default: "NONE" },
            isSecurityDowngrade: { type: "bool", default: false },
        },
    }
}
