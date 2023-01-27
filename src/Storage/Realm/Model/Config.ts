import { Object } from "realm"

export class Config extends Object<Config> {
    _id = "APP_CONFIG"
    isEncryptionKey?: boolean
    isFirstAppLoad?: boolean
    isWallet?: boolean
    isSecurityDowngrade?: boolean

    static primaryKey = "_id"

    constructor(realm: Realm) {
        super(realm, {
            isEncryptionKey: false,
            isFirstAppLoad: false,
            isWallet: false,
            isSecurityDowngrade: false,
        })
    }
}
