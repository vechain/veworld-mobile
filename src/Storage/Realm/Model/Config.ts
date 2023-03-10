import { Object } from "realm"
import { Network } from "./Network"

export class Config extends Object {
    _id!: string
    isWalletCreated!: boolean
    userSelectedSecurity!: string
    isAppLockActive!: boolean
    lastSecurityLevel!: string
    isSecurityDowngrade!: boolean
    isResettingApp!: boolean
    pinValidationString!: string
    currentNetwork!: Network
    showTestNetTag!: boolean
    showConversionOtherNets!: boolean

    static getName(): string {
        return Config.schema.name
    }

    static getPrimaryKey(): string {
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
            isResettingApp: { type: "bool", default: false },
            pinValidationString: {
                type: "string",
                default: "SUCCESS PASSWORD IS CORRECT",
            },
            currentNetwork: "Network",
            showTestNetTag: { type: "bool", default: true },
            showConversionOtherNets: { type: "bool", default: true },
        },
    }
}
