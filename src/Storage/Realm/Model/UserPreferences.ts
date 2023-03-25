import { Object } from "realm"
import { Network } from "./Network"

export class UserPreferences extends Object {
    _id!: string
    theme!: "light" | "dark"
    currentNetwork!: Network
    showTestNetTag!: boolean
    showConversionOtherNets!: boolean
    isAppLockActive!: boolean
    balanceVisible!: boolean
    currency!: string
    language!: string

    static getName(): string {
        return UserPreferences.schema.name
    }

    static getPrimaryKey(): string {
        return UserPreferences.schema.name
    }

    static schema = {
        name: "UserPreferences",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "UserPreferences" },
            theme: { type: "string", default: "light" },
            currentNetwork: "Network",
            showTestNetTag: { type: "bool", default: true },
            showConversionOtherNets: { type: "bool", default: true },
            isAppLockActive: { type: "bool" },
            balanceVisible: { type: "bool", default: true },
            currency: { type: "string", default: "euro" },
            language: { type: "string", default: "English" },
        },
    }
}

export const getUserPreferences = (store: Realm): UserPreferences => {
    return store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    ) as UserPreferences
}
