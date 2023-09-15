import { HexUtils } from "~Utils"
import { Keychain } from "~Storage"

const SALT_STORE_KEY = "salt"

const _storeNewSalt = async (): Promise<string> => {
    const salt = HexUtils.generateRandom(256)

    await Keychain.set({
        key: SALT_STORE_KEY,
        value: salt,
    })

    return salt
}

const getSalt = async (): Promise<string> => {
    let salt = await Keychain.get({
        key: SALT_STORE_KEY,
    })

    if (!salt) {
        salt = await _storeNewSalt()
    }

    return salt
}

export default {
    getSalt,
}
