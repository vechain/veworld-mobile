import { Keychain } from "~Storage"
import { error } from "~Utils/Logger"
import * as SecureStore from "expo-secure-store"
import * as i18n from "~i18n"

const WALLET_KEY = "VeWorld_Wallet_key"
const REDUX_KEY = "VeWorld_Redux_key"

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

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${getAccessControl(
                true,
            )}_${rootAddress}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${getAccessControl(
                false,
            )}_${rootAddress}`,
        }
    }

    try {
        return await Keychain.get(
            options,
            `${WALLET_KEY}_${getAccessControl(
                accessControl ?? false,
            )}_${rootAddress}`,
        )
    } catch (err) {
        error(err)
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

    let options: any

    if (accessControl) {
        options = {
            requireAuthentication: accessControl,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${getAccessControl(
                true,
            )}_${rootAddress}`,
            authenticationPrompt: promptTitle.toString(),
        }
    } else {
        options = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            keychainService: `${WALLET_KEY}_${getAccessControl(
                false,
            )}_${rootAddress}`,
        }
    }

    try {
        await Keychain.set(
            encryptionKey,
            options,
            `${WALLET_KEY}_${getAccessControl(
                accessControl ?? false,
            )}_${rootAddress}`,
        )
    } catch (err) {
        error(err)
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
    const options = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: `${WALLET_KEY}_${rootAddress}`,
    }

    try {
        await Keychain.deleteItem(
            `${WALLET_KEY}_${getAccessControl(accessControl)}_${rootAddress}`,
            options,
        )
    } catch (err) {
        error(err)
    }
}

const getReduxKey = async () => {
    const options = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
    }

    try {
        return await Keychain.get(options, REDUX_KEY)
    } catch (err) {
        error(err)
    }
}

const setReduxKey = async (Enckey: string) => {
    const options = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
    }

    try {
        await Keychain.set(Enckey, options, REDUX_KEY)
    } catch (err) {
        error(err)
    }
}

export default {
    getDeviceEncryptionKey,
    setDeviceEncryptionKey,
    deleteDeviceEncryptionKey,
    getReduxKey,
    setReduxKey,
}
