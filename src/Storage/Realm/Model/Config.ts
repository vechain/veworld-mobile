import { Object } from "realm"

export class Config extends Object<Config> {
    _id = "APP_CONFIG"

    // internal
    isEncryptionKeyCreated = false

    // lock screen
    userSelectedSecurtiy = "NONE"
    isAppLockActive = true

    // downgrade
    lastSecurityLevel = "NONE"
    isSecurityDowngrade = false

    static primaryKey = "_id"

    constructor(realm: Realm) {
        super(realm, {
            isEncryptionKeyCreated: false,
            isSecurityDowngrade: false,
            lastSecurityLevel: "NONE",
            userSelectedSecurtiy: "NONE",
            isAppLockActive: true,
        })
    }
}
