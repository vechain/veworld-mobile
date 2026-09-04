import { MMKV } from "react-native-mmkv"
import { DEVICE_TYPE } from "~Model"
import { CryptoUtils } from "~Utils"

type IMigrateState = {
    onboardingStorage: MMKV
    encryptedStorage: MMKV
    onboardingKey: string
    encryptionKey: string
}

const ROOT_STATE_KEY = "persist:root"

const decryptPersistedState = (persistedState: string, encryptionKey: string): Record<string, unknown> => {
    const state = JSON.parse(persistedState) as Record<string, string>

    return Object.fromEntries(
        Object.entries(state).map(([key, encrypted]) => {
            if (typeof encrypted !== "string") throw new Error(`Invalid persisted slice: ${key}`)

            let ciphertext: unknown
            try {
                ciphertext = JSON.parse(encrypted)
            } catch {
                ciphertext = encrypted
            }

            if (typeof ciphertext !== "string") throw new Error(`Invalid persisted slice: ${key}`)
            const normalizedCiphertext = ciphertext.startsWith("0x") ? ciphertext.slice(2) : ciphertext
            return [key, JSON.parse(CryptoUtils.decryptState(normalizedCiphertext, encryptionKey))]
        }),
    )
}

const validateMigratedState = (persistedState: string, encryptionKey: string) => {
    const state = decryptPersistedState(persistedState, encryptionKey)
    const devices = state.devices
    const accounts = state.accounts as { selectedAccount?: unknown } | undefined

    if (!Array.isArray(devices) || devices.length === 0) throw new Error("Migrated state has no devices")
    if (!accounts || typeof accounts !== "object" || !accounts.selectedAccount) {
        throw new Error("Migrated state has no selected account")
    }

    for (const device of devices) {
        if (!device || typeof device !== "object") throw new Error("Migrated state contains an invalid device")

        const candidate = device as { type?: DEVICE_TYPE; wallet?: string }
        const isLocalDevice =
            candidate.type === DEVICE_TYPE.LOCAL_MNEMONIC || candidate.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY

        if (isLocalDevice && !candidate.wallet) throw new Error("Migrated local device has no encrypted wallet")
    }
}

const migrateState = ({ onboardingStorage, encryptedStorage, onboardingKey, encryptionKey }: IMigrateState) => {
    const persistedState = onboardingStorage.getString(ROOT_STATE_KEY)

    if (!persistedState) {
        throw new Error("No persist:root found in onboarding storage")
    }

    const state = decryptPersistedState(persistedState, onboardingKey)

    const newState: Record<string, string> = {}

    for (const key of Object.keys(state)) {
        const value = CryptoUtils.encryptState(state[key], encryptionKey)

        newState[key] = `"${value}"`
    }

    encryptedStorage.set(ROOT_STATE_KEY, JSON.stringify(newState))

    const migratedState = encryptedStorage.getString(ROOT_STATE_KEY)
    if (!migratedState) throw new Error("Failed to write migrated state")
    validateMigratedState(migratedState, encryptionKey)
}

const prune = (onboardingStorage: MMKV) => {
    const keys = onboardingStorage.getAllKeys()

    for (const key of keys) {
        onboardingStorage.delete(key)
    }
}

export default {
    migrateState,
    decryptPersistedState,
    validateMigratedState,
    prune,
}
