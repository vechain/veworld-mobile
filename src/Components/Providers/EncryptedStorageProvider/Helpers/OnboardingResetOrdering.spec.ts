import { MMKV } from "react-native-mmkv"
import { DEVICE_TYPE } from "~Model"
import { CryptoUtils } from "~Utils"
import { Keychain } from "~Storage"
import Onboarding from "./Onboarding"
import StorageEncryptionKeyHelper from "./StorageEncryptionKeyHelper"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"

/**
 * The encrypted redux state holding `devices[].wallet` and the vault key that opens that
 * blob are cleared independently during a reset. These tests pin the ordering invariant:
 * the state must go first, so an interrupted reset can never leave a device record
 * behind without the key that decrypts it.
 */

jest.mock("~Storage", () => ({
    Keychain: {
        set: jest.fn(),
        get: jest.fn(),
        deleteItem: jest.fn(),
    },
}))

// The native scrypt binding has no jest implementation. A fixed 32-byte key paired with
// the global identity cipher mock is enough for encrypt/decrypt to round-trip.
jest.mock("react-native-scrypt", () => jest.fn(async () => "a".repeat(64)))

const ROOT_STATE_KEY = "persist:root"
const ONBOARDING_KEY = "onboarding-key"
const ROOT_ADDRESS = "0xec954b8e81777354d0a35111d83373b9ec171c64"
const WALLET_BLOB = "encrypted-wallet-blob"

const WALLET_BIOMETRIC_SLOT = "WALLET_BIOMETRIC_KEY_STORAGE"
const STORAGE_BIOMETRIC_SLOT = "BIOMETRIC_KEY_STORAGE"

/** Key-sensitive stand-in for the redux state cipher: decrypting with the wrong key throws. */
const installStateCipher = () => {
    jest.spyOn(CryptoUtils, "encryptState").mockImplementation(
        (value, key) => `enc[${key}]${Buffer.from(JSON.stringify(value)).toString("hex")}`,
    )
    jest.spyOn(CryptoUtils, "decryptState").mockImplementation((value, key) => {
        const match = /^enc\[(.*?)\](.*)$/.exec(value)
        if (!match) throw new Error("Could not decrypt state")
        if (match[1] !== key) throw new Error("Could not decrypt state")
        return Buffer.from(match[2], "hex").toString()
    })
}

const createStorage = () => {
    const values = new Map<string, string>()

    return {
        storage: {
            getString: jest.fn((key: string) => values.get(key)),
            set: jest.fn((key: string, value: string) => values.set(key, value)),
            delete: jest.fn((key: string) => values.delete(key)),
            getAllKeys: jest.fn(() => [...values.keys()]),
            clearAll: jest.fn(() => values.clear()),
        } as unknown as MMKV,
        values,
    }
}

describe("onboarding reset ordering", () => {
    /** The phone's secure vault: iOS Keychain / Android Keystore, keyed by slot name. */
    let vault: Map<string, string>
    /** Slots whose deletion fails: anything stopping the rollback between the two
     * removals — a vault error, or the process being killed. */
    let undeletableSlots: Set<string>
    let onboardingStorage: ReturnType<typeof createStorage>
    let encryptedStorage: ReturnType<typeof createStorage>

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        installStateCipher()

        vault = new Map()
        undeletableSlots = new Set()
        onboardingStorage = createStorage()
        encryptedStorage = createStorage()
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ key, value }) => {
            vault.set(key, value)
        })
        ;(Keychain.get as jest.Mock).mockImplementation(async ({ key }) => vault.get(key) ?? null)
        ;(Keychain.deleteItem as jest.Mock).mockImplementation(async ({ key }) => {
            if (undeletableSlots.has(key)) throw new Error("keychain unavailable")
            vault.delete(key)
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    /** What `createLocalWallet` leaves in onboarding storage before the migration runs. */
    const seedOnboardingState = () => {
        const devices = [
            {
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                rootAddress: ROOT_ADDRESS,
                alias: "Wallet 1",
                wallet: WALLET_BLOB,
            },
        ]
        const accounts = { selectedAccount: { address: ROOT_ADDRESS } }

        onboardingStorage.values.set(
            ROOT_STATE_KEY,
            JSON.stringify({
                devices: JSON.stringify(CryptoUtils.encryptState(devices, ONBOARDING_KEY)),
                accounts: JSON.stringify(CryptoUtils.encryptState(accounts, ONBOARDING_KEY)),
            }),
        )
    }

    /** Mirrors useHandleWalletCreation.onCreateWallet -> migrateOnboarding, up to the
     * point of failure: wallet key, device, storage key, state migrated. */
    const createWalletUpToMigration = async () => {
        await WalletEncryptionKeyHelper.init()
        seedOnboardingState()

        const storageKeys = await StorageEncryptionKeyHelper.init()
        Onboarding.migrateState({
            onboardingStorage: onboardingStorage.storage,
            encryptedStorage: encryptedStorage.storage,
            onboardingKey: ONBOARDING_KEY,
            encryptionKey: storageKeys.redux,
        })

        return storageKeys
    }

    /** The previous order: vault first, encrypted state last. Kept to pin the
     * difference the current order makes. */
    const legacyResetApplication = async () => {
        onboardingStorage.storage.clearAll()
        await WalletEncryptionKeyHelper.remove()
        await StorageEncryptionKeyHelper.remove()
        encryptedStorage.storage.clearAll()
    }

    /** The current order in ApplicationSecurityProvider.tsx: encrypted state, then vault. */
    const resetApplication = async () => {
        onboardingStorage.storage.clearAll()
        encryptedStorage.storage.clearAll()
        await WalletEncryptionKeyHelper.remove()
        await StorageEncryptionKeyHelper.remove()
    }

    const readMigratedDevices = (encryptionKey: string) => {
        const persisted = encryptedStorage.values.get(ROOT_STATE_KEY)
        if (!persisted) return undefined

        const state = Onboarding.decryptPersistedState(persisted, encryptionKey)
        return state.devices as { rootAddress: string; wallet: string }[]
    }

    it("clearing the vault before the state leaves a device record without its key", async () => {
        const storageKeys = await createWalletUpToMigration()

        // The rollback starts, but the vault refuses the second deletion.
        undeletableSlots.add(STORAGE_BIOMETRIC_SLOT)
        await expect(legacyResetApplication()).rejects.toThrow("keychain unavailable")

        // Next launch takes the LOCKED branch rather than re-onboarding, and unlocks:
        // the storage key survived.
        expect(encryptedStorage.storage.getAllKeys()).toContain(ROOT_STATE_KEY)
        await expect(StorageEncryptionKeyHelper.get({})).resolves.toEqual(storageKeys)

        // The wallet is still listed, with its address and its encrypted blob.
        const devices = readMigratedDevices(storageKeys.redux)
        expect(devices).toHaveLength(1)
        expect(devices?.[0].rootAddress).toBe(ROOT_ADDRESS)
        expect(devices?.[0].wallet).toBe(WALLET_BLOB)

        // But the slot is empty, so the decrypt paths throw before reaching the cipher.
        expect(vault.has(WALLET_BIOMETRIC_SLOT)).toBe(false)
        await expect(WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: WALLET_BLOB })).rejects.toThrow(
            "No key found",
        )
    })

    it("a verified encryption round-trip at creation does not protect the key afterwards", async () => {
        // Both creation-time guarantees hold here: KeyCommit inside init(), and the
        // encryptWallet round-trip below.
        await WalletEncryptionKeyHelper.init()

        const wallet = {
            rootAddress: ROOT_ADDRESS,
            nonce: "0",
            mnemonic: "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" "),
        }
        // Throws unless the minted key can encrypt AND decrypt this wallet. It passes.
        const encryptedWallet = await WalletEncryptionKeyHelper.encryptWallet(wallet)
        await expect(WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet })).resolves.toMatchObject({
            rootAddress: ROOT_ADDRESS,
        })

        // Onboarding continues past that verified point, then the rollback is interrupted.
        seedOnboardingState()
        const storageKeys = await StorageEncryptionKeyHelper.init()
        Onboarding.migrateState({
            onboardingStorage: onboardingStorage.storage,
            encryptedStorage: encryptedStorage.storage,
            onboardingKey: ONBOARDING_KEY,
            encryptionKey: storageKeys.redux,
        })

        undeletableSlots.add(STORAGE_BIOMETRIC_SLOT)
        await expect(legacyResetApplication()).rejects.toThrow("keychain unavailable")

        // Nothing re-checks the key once onboarding finishes, and it is now gone.
        await expect(WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet })).rejects.toThrow("No key found")
        expect(readMigratedDevices(storageKeys.redux)).toHaveLength(1)
    })

    it("clearing the state first leaves nothing behind when the reset is interrupted", async () => {
        const storageKeys = await createWalletUpToMigration()

        // Same interruption as the failing case above, against the current order.
        undeletableSlots.add(STORAGE_BIOMETRIC_SLOT)
        await expect(resetApplication()).rejects.toThrow("keychain unavailable")

        // The wallet key is gone as before, but no device record is left behind: the
        // next launch takes FIRST_TIME_ACCESS and onboards fresh.
        expect(vault.has(WALLET_BIOMETRIC_SLOT)).toBe(false)
        expect(encryptedStorage.storage.getAllKeys()).toHaveLength(0)
        expect(readMigratedDevices(storageKeys.redux)).toBeUndefined()
    })

    it("leaves nothing behind when the reset runs to completion", async () => {
        const storageKeys = await createWalletUpToMigration()

        await expect(resetApplication()).resolves.toBeUndefined()

        // Both keys gone and the migrated state cleared: the next launch onboards fresh.
        expect(vault.has(WALLET_BIOMETRIC_SLOT)).toBe(false)
        expect(vault.has(STORAGE_BIOMETRIC_SLOT)).toBe(false)
        expect(readMigratedDevices(storageKeys.redux)).toBeUndefined()
    })

    it("losing the whole vault leaves no readable device record", async () => {
        await createWalletUpToMigration()

        // Device migration / keystore invalidation: app storage survives, the vault does
        // not, and both keys go together.
        vault.clear()

        // Without the redux key the state never decrypts, so no device record is
        // readable at all — a different outcome from the asymmetric case above.
        await expect(StorageEncryptionKeyHelper.get({})).rejects.toThrow("No key found")
        expect(() => readMigratedDevices("any-other-key")).toThrow()
    })
})
