import { Object } from "realm"

export class Config extends Object {
    _id!: string
    isWalletCreated!: boolean
    userSelectedSecurity!: string
    isAppLockActive!: boolean
    lastSecurityLevel!: string
    isSecurityDowngrade!: boolean

    static getName(): string {
        return Config.schema.name
    }

    static PrimaryKey(): string {
        return Config.schema.name
    }

    static schema = {
        name: "Config",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "Config" },
            isWalletCreated: { type: "bool", default: false },
            userSelectedSecurity: { type: "string", default: "NONE" },
            isAppLockActive: { type: "bool", default: true },
            lastSecurityLevel: { type: "string", default: "NONE" },
            isSecurityDowngrade: { type: "bool", default: false },
        },
    }
}
