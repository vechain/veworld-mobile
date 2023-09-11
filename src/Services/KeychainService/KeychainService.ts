import { Keychain } from "~Storage"
import { error } from "~Utils/Logger"
import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

const WALLET_KEY = "VeWorld_Wallet_key"

enum ACCESS_CONTROL_KEY {
    ACCESS_CONTROL = "access_control",
    NO_ACCESS_CONTROL = "no_access_control",
}

const getAccessControl = (accessControl: boolean) => {
    return accessControl
        ? ACCESS_CONTROL_KEY.ACCESS_CONTROL
        : ACCESS_CONTROL_KEY.NO_ACCESS_CONTROL
}

/**
 * Get the encryption key for the device. Used to decrypt the wallet
 * @param rootAddress  rootAddress of device
 * @param accessControl  if true, the user will be prompted to authenticate with biometrics
 * @returns
 */
const getDeviceEncryptionKey = async (
    rootAddress: string,
    accessControl?: boolean,
) => {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    let options: SecureStoreOptions
    const key: string = `${WALLET_KEY}_${getAccessControl(
        !!accessControl,
    )}_${rootAddress}`

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: key,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: key,
        }
    }

    try {
        return await Keychain.get({ options, key })
    } catch (err) {
        error("getDeviceEncryptionKey", err)
    }
}

/**
 *  Set the encryption key for the device. Used to decrypt the wallet
 * @param encryptionKey  the encryption key to store
 * @param rootAddress  rootAddress of device
 * @param accessControl  if true, the user will be prompted to authenticate with biometrics
 */
const setDeviceEncryptionKey = async (
    encryptionKey: string,
    rootAddress: string,
    accessControl?: boolean,
) => {
    const locale = i18n.detectLocale()
    let promptTitle = i18n.i18n()[locale].BIOMETRICS_PROMPT()

    const key = `${WALLET_KEY}_${getAccessControl(
        !!accessControl,
    )}_${rootAddress}`
    let options: SecureStoreOptions

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: key,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: key,
        }
    }

    try {
        await Keychain.set({ key, value: encryptionKey, options })
    } catch (err) {
        error("setDeviceEncryptionKey", err)
        throw new Error("Error setting encryption key")
    }
}

/**
 *  Delete the encryption key for the device. Used to decrypt the wallet
 * @param rootAddress rootAddress of device
 */
const deleteDeviceEncryptionKey = async (
    rootAddress: string,
    accessControl: boolean,
) => {
    const key = `${WALLET_KEY}_${getAccessControl(
        accessControl,
    )}_${rootAddress}`

    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: key,
    }

    try {
        await Keychain.deleteItem({ options, key })
    } catch (err) {
        error("deleteDeviceEncryptionKey", err)
    }
}

const deleteKey = async (key: string) => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: key,
    }

    try {
        await Keychain.deleteItem({ options, key })
    } catch (err) {
        error("deleteKey", err)
    }
}

const getKey = async (key: string) => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: key,
    }

    try {
        return await Keychain.get({ options, key })
    } catch (err) {
        error("getKey", err)
    }
}

const setKey = async (key: string, value: string) => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: key,
    }

    try {
        await Keychain.set({ options, key, value })
    } catch (err) {
        error("setKey", err)
    }
}

export default {
    getDeviceEncryptionKey,
    setDeviceEncryptionKey,
    deleteDeviceEncryptionKey,
    getKey,
    setKey,
    deleteKey,
}
