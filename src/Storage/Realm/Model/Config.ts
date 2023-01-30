import { Object } from "realm"

export class Config extends Object<Config> {
    _id = "APP_CONFIG"
    isEncryptionKey = false
    isFirstAppLoad = true
    isWallet = false
    lastSecurityLevel: "NONE" | "SECRET" | "BIOMETRIC" = "NONE"
    isSecurityDowngrade = false

    static primaryKey = "_id"

    constructor(realm: Realm) {
        super(realm, {
            isEncryptionKey: false,
            isFirstAppLoad: true,
            isWallet: false,
            isSecurityDowngrade: false,
            lastSecurityLevel: "NONE",
        })
    }
}
