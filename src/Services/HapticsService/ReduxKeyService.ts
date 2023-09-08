import * as SecureStore from "expo-secure-store"
import { Keychain } from "~Storage"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"
import { error } from "~Utils"

const REDUX_KEY = "Redux_Encryption_Key"
const getPinCodeKey = async () => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
    }

    try {
        return await Keychain.get(options, REDUX_KEY)
    } catch (err) {
        error("Failed to get Pin Code Key", err)
        throw err
    }
}

const getBiometricKey = async () => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
        requireAuthentication: true,
    }

    try {
        return await Keychain.get(options, REDUX_KEY)
    } catch (err) {
        error("Failed to get Biometrics", err)
        throw err
    }
}

const setPinCodeKey = async (key: string) => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
    }

    try {
        return await Keychain.set(key, options, REDUX_KEY)
    } catch (err) {
        error("Failed to set Pin Code Key", err)
        throw err
    }
}

const setBiometricKey = async (key: string) => {
    const options: SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        keychainService: REDUX_KEY,
    }

    try {
        return await Keychain.set(key, options, REDUX_KEY)
    } catch (err) {
        error("Failed to set Biometrics", err)
        throw err
    }
}

export default {
    getPinCodeKey,
    getBiometricKey,
}
