import { Keychain } from "~Storage"
import { error } from "~Common"
import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"

const WALLET_KEY = "VeWorld_Wallet_key"
const REALM_KEY = "VeWorld_Realm_key"

const getEncryptionKey = async (
    deviceIndex: number,
    accessControl?: boolean,
) => {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
        }
    }

    try {
        return await Keychain.get(options, `${WALLET_KEY}_${deviceIndex}`)
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (
    Enckey: string,
    deviceIndex: number,
    accessControl?: boolean,
) => {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${deviceIndex}`,
        }
    }

    try {
        await Keychain.set(Enckey, options, `${WALLET_KEY}_${deviceIndex}`)
    } catch (err) {
        error(err)
    }
}

const getRealmKey = async (accessControl?: boolean) => {
    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: REALM_KEY,
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: REALM_KEY,
        }
    }

    try {
        return await Keychain.get(options, REALM_KEY)
    } catch (err) {
        error(err)
    }
}

const setRealmKey = async (Enckey: string, accessControl?: boolean) => {
    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: REALM_KEY,
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: REALM_KEY,
        }
    }

    try {
        await Keychain.set(Enckey, options, REALM_KEY)
    } catch (err) {
        error(err)
    }
}

export default {
    getEncryptionKey,
    setEncryptionKey,
    getRealmKey,
    setRealmKey,
}
