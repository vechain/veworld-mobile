import { HexUtils } from "~Utils"
import { Keychain } from "~Storage"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

const SALT_STORE_KEY = "salt"

const SALT_OPTIONS: SecureStoreOptions = {
    requireAuthentication: false,
}
const _storeNewSalt = async (): Promise<string> => {
    const salt = HexUtils.generateRandom(256)

    await Keychain.set({
        key: SALT_STORE_KEY,
        value: salt,
        options: SALT_OPTIONS,
    })

    return salt
}

const getSalt = async (): Promise<string> => {
    let salt = await Keychain.get({
        key: SALT_STORE_KEY,
        options: SALT_OPTIONS,
    })

    if (!salt) {
        salt = await _storeNewSalt()
    }

    return salt
}

export default {
    getSalt,
}
