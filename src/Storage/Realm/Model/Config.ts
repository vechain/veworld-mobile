import { Object } from "realm"

export class Config extends Object {
    _id!: string
    isWalletCreated!: boolean
    userSelectedSecurity!: string
    lastSecurityLevel!: string
    isSecurityDowngrade!: boolean
    isResettingApp!: boolean
    pinValidationString!: string

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
            lastSecurityLevel: { type: "string", default: "NONE" },
            isSecurityDowngrade: { type: "bool", default: false },
            isResettingApp: { type: "bool", default: false },
            pinValidationString: {
                type: "string",
                default: "SUCCESS PASSWORD IS CORRECT",
            },
        },
    }
}

export const getConfig = (store: Realm): Config =>
    store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    ) as Config
