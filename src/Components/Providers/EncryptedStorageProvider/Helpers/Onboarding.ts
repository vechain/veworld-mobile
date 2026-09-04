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

// Throws fixed messages only: a raw SyntaxError would quote its input (ciphertext,
// or worse, decrypted plaintext) and propagate to logging/Sentry.
const decryptPersistedState = (persistedState: string, encryptionKey: string): Record<string, unknown> => {
    let state: Record<string, string>
    try {
        state = JSON.parse(persistedState) as Record<string, string>
    } catch {
        throw new Error("Persisted state is not valid JSON")
    }

    return Object.fromEntries(
        Object.entries(state).map(([key, encrypted]) => {
            if (typeof encrypted !== "string") throw new Error(`Invalid persisted slice: ${key}`)

            // Every producer of persist:root (redux-persist's serialize, migrateState
            // below) JSON-quotes the slice ciphertext.
            let ciphertext: unknown
            try {
                ciphertext = JSON.parse(encrypted)
            } catch {
                throw new Error(`Invalid persisted slice: ${key}`)
            }

            if (typeof ciphertext !== "string") throw new Error(`Invalid persisted slice: ${key}`)
            const normalizedCiphertext = ciphertext.startsWith("0x") ? ciphertext.slice(2) : ciphertext

            const decrypted = CryptoUtils.decryptState(normalizedCiphertext, encryptionKey)
            try {
                return [key, JSON.parse(decrypted)]
            } catch {
                throw new Error(`Invalid persisted slice: ${key}`)
            }
        }),
    )
}

const validateDecryptedState = (state: Record<string, unknown>) => {
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

        if (isLocalDevice && (typeof candidate.wallet !== "string" || candidate.wallet.trim().length === 0)) {
            throw new Error("Migrated local device has no encrypted wallet")
        }
    }
}

const migrateState = ({ onboardingStorage, encryptedStorage, onboardingKey, encryptionKey }: IMigrateState) => {
    const persistedState = onboardingStorage.getString(ROOT_STATE_KEY)

    if (!persistedState) {
        throw new Error("No persist:root found in onboarding storage")
    }

    const state = decryptPersistedState(persistedState, onboardingKey)

    // Validate before anything is written: a broken snapshot must fail the
    // migration, not survive it.
    validateDecryptedState(state)

    const newState: Record<string, string> = {}

    for (const key of Object.keys(state)) {
        const value = CryptoUtils.encryptState(state[key], encryptionKey)

        newState[key] = `"${value}"`
    }

    const serializedState = JSON.stringify(newState)
    encryptedStorage.set(ROOT_STATE_KEY, serializedState)

    // Detect a failed or partial MMKV write without re-decrypting every slice.
    const migratedState = encryptedStorage.getString(ROOT_STATE_KEY)
    if (migratedState !== serializedState) throw new Error("Failed to write migrated state")
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
    prune,
}
