import { Object } from "realm"

export class Config extends Object<Config> {
    _id = "APP_CONFIG"
    isEncryptionKey = false
    isFirstAppLoad = true
    isWallet = false
    lastSecurityLevel = "NONE"
    isSecurityDowngrade = false
    userSelectedSecurtiy = "NONE"
    isAppLockActive = true

    static primaryKey = "_id"

    constructor(realm: Realm) {
        super(realm, {
            isEncryptionKey: false,
            isFirstAppLoad: true,
            isWallet: false,
            isSecurityDowngrade: false,
            lastSecurityLevel: "NONE",
            userSelectedSecurtiy: "NONE",
            isAppLockActive: true,
        })
    }
}
