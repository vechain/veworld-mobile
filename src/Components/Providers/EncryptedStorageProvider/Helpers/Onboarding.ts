import { MMKV } from "react-native-mmkv"
import { CryptoUtils } from "~Utils"

type IMigrateState = {
    onboardingStorage: MMKV
    encryptedStorage: MMKV
    onboardingKey: string
    encryptionKey: string
}

const ROOT_STATE_KEY = "persist:root"

const migrateState = ({
    onboardingStorage,
    encryptedStorage,
    onboardingKey,
    encryptionKey,
}: IMigrateState) => {
    const persistedState = onboardingStorage.getString(ROOT_STATE_KEY)

    if (!persistedState) {
        throw new Error("No persist:root found in onboarding storage")
    }

    const state = JSON.parse(persistedState)

    const newState: Record<string, string> = {}

    for (const key of Object.keys(state)) {
        const encrypted = state[key] as string

        const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")

        const unencrypted = CryptoUtils.decryptState(toDecrypt, onboardingKey)

        const value = CryptoUtils.encryptState(unencrypted, encryptionKey)

        newState[key] = `"${value}"`
    }

    encryptedStorage.set(ROOT_STATE_KEY, JSON.stringify(newState))
}

const prune = (onboardingStorage: MMKV) => {
    const keys = onboardingStorage.getAllKeys()

    for (const key of keys) {
        onboardingStorage.delete(key)
    }
}

export default {
    migrateState,
    prune,
}
