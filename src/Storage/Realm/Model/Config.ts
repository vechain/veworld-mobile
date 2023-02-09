import { Object } from "realm"

export class Config extends Object<Config> {
    _id = "APP_CONFIG"

    // internal
    isEncryptionKey = false
    isWallet = false

    // lock screen
    isFirstAppLoad = true
    userSelectedSecurtiy = "NONE"
    isAppLockActive = true

    // downgrade
    lastSecurityLevel = "NONE"
    isSecurityDowngrade = false

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
