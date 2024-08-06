import { HexUtils, PasswordUtils } from "~Utils"
import { Keychain } from "~Storage"

const SALT_STORE_KEY = "salt"
const SALT_AND_IV_STORE_KEY = "salt_and_iv"

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

const _storeNewSaltAndIV = async (): Promise<string> => {
    const salt = HexUtils.generateRandom(256)
    const iv = PasswordUtils.getRandomIV(16)
    const ivToBase64 = PasswordUtils.bufferToBase64(iv)

    await Keychain.set({
        key: SALT_AND_IV_STORE_KEY,
        value: `salt:${salt},iv:${ivToBase64}`,
    })

    return `salt:${salt},iv:${ivToBase64}`
}

const getSaltAndIV = async (): Promise<{ salt: string; iv: string }> => {
    let saltAndIV = await Keychain.get({
        key: SALT_AND_IV_STORE_KEY,
    })

    if (!saltAndIV) {
        saltAndIV = await _storeNewSaltAndIV()
    }

    // we save both salt and iv in the same key in order to avoid multiple keychain accesses
    // we split this -> `salt:${salt},iv:${ivToBase64}`,
    let salt = saltAndIV.split(",")[0].split(":")[1]
    let iv = saltAndIV.split(",")[1].split(":")[1]

    return { salt, iv }
}

export default {
    getSalt,
    getSaltAndIV,
}
