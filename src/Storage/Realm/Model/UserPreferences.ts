import { Object } from "realm"
import { Network } from "./Network"

export class UserPreferences extends Object {
    _id!: string
    theme!: "dark" | "light"
    currentNetwork!: Network
    showTestNetTag!: boolean
    showConversionOtherNets!: boolean
    isAppLockActive!: boolean

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
            isAppLockActive: { type: "bool", default: true },
        },
    }
}
