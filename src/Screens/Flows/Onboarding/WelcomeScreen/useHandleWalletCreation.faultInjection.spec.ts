import { act, renderHook } from "@testing-library/react-hooks"
import { showErrorToast, showInfoToast } from "~Components"
// The real helpers, imported past the mocked ~Components barrel.
import {
    resetOnboardingOperation,
    runOnboardingOperationOnce,
    runOnboardingStorageMigration,
    StorageEncryptionKeyHelper,
    WalletEncryptionKeyHelper,
} from "~Components/Providers/EncryptedStorageProvider/Helpers"
import { StorageEncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { DerivationPath } from "~Constants"
import { DEVICE_TYPE, SecurityLevelType, WALLET_STATUS } from "~Model"
import { Keychain } from "~Storage"
import { CryptoUtils } from "~Utils"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

/**
 * Invariant under test: a local wallet may exist in state only while the current wallet
 * key decrypts it, and the wallet key is never replaced while such a wallet exists.
 *
 * The harness drives the real hook, the real key helpers and the real single-flight
 * latch against a fake keychain that can fail once at any slot and operation, with a
 * key-sensitive cipher so a rotated key is observable. Every onboarding step is failed
 * in turn, once as a cancelled biometric prompt and once as a keychain error, and the
 * invariant is checked after the failure and after the retry that follows.
 *
 * Under jest Platform.OS is ios, so the cancelled prompt carries the iOS code (-128).
 */

const WALLET_SLOT = "WALLET_BIOMETRIC_KEY_STORAGE"
const STORAGE_SLOT = "BIOMETRIC_KEY_STORAGE"

type FakeDevice = { rootAddress: string; type: DEVICE_TYPE; wallet: string; position: number }
type Fault = { slot: string; op: "set" | "get"; error: Error }

/** Redux and encrypted storage, as the hook and the provider see them. */
const mockState = {
    walletStatus: WALLET_STATUS.FIRST_TIME_ACCESS as WALLET_STATUS,
    /** onboarding redux: local devices and their encrypted wallets */
    devices: [] as FakeDevice[],
    /** what the last successful migration committed to encrypted storage */
    committed: [] as FakeDevice[],
    committedKeys: undefined as StorageEncryptionKeys | undefined,
    /** thrown by the next migration, then cleared */
    migrationFailure: undefined as Error | undefined,
}

const mockDispatch = jest.fn((action: { type: string }) => {
    // resetApp() resets every slice, devices and accounts included.
    if (action.type === "reset-app") mockState.devices.length = 0
    return action
})
const mockCreateLocalWallet = jest.fn()
const mockPersistor = { flush: jest.fn().mockResolvedValue(undefined), pause: jest.fn(), persist: jest.fn() }
const mockStore = { getState: () => ({ devices: mockState.devices }) }

/**
 * The provider's migration. New contract: the hook mints the storage key before any wallet
 * exists and passes it in. Legacy contract, a pin or nothing: mint it here as the provider
 * used to, so this spec also runs, and fails, against the previous implementation.
 */
const mockMigrateOnboarding = jest.fn(async (_type: SecurityLevelType, keysOrPin?: StorageEncryptionKeys | string) => {
    const keys =
        keysOrPin && typeof keysOrPin === "object"
            ? keysOrPin
            : await StorageEncryptionKeyHelper.init(typeof keysOrPin === "string" ? keysOrPin : undefined)

    if (mockState.migrationFailure) {
        const failure = mockState.migrationFailure
        mockState.migrationFailure = undefined
        throw failure
    }

    mockState.committed = [...mockState.devices]
    mockState.committedKeys = keys
})

// The hook imports these through the ~Components barrel, which is mocked below. Delegate to
// the REAL implementations lazily so jest.spyOn on the imported objects is observed.
const mockRunOnce = (operation: () => Promise<void>) => runOnboardingOperationOnce(operation)
const mockRunMigration = (
    persistor: Parameters<typeof runOnboardingStorageMigration>[0],
    migration: () => Promise<void>,
) => runOnboardingStorageMigration(persistor, migration)
const mockWalletKeys = {
    init: (pin?: string) => WalletEncryptionKeyHelper.init(pin),
    remove: () => WalletEncryptionKeyHelper.remove(),
}
const mockStorageKeys = {
    init: (pin?: string) => StorageEncryptionKeyHelper.init(pin),
    remove: () => StorageEncryptionKeyHelper.remove(),
}

jest.mock("~Components", () => ({
    runOnboardingOperationOnce: (operation: () => Promise<void>) => mockRunOnce(operation),
    runOnboardingStorageMigration: (persistor: unknown, migration: () => Promise<void>) =>
        mockRunMigration(persistor as Parameters<typeof mockRunMigration>[0], migration),
    showErrorToast: jest.fn(),
    showInfoToast: jest.fn(),
    useApplicationSecurity: () => ({ migrateOnboarding: mockMigrateOnboarding, walletStatus: mockState.walletStatus }),
    useStore: () => ({ persistor: mockPersistor, store: mockStore }),
    WalletEncryptionKeyHelper: {
        init: (pin?: string) => mockWalletKeys.init(pin),
        remove: () => mockWalletKeys.remove(),
    },
    StorageEncryptionKeyHelper: {
        init: (pin?: string) => mockStorageKeys.init(pin),
        remove: () => mockStorageKeys.remove(),
    },
}))

jest.mock("~Hooks", () => ({
    useBiometrics: jest.fn(() => ({ currentSecurityLevel: "BIOMETRIC" })),
    useCreateWallet: jest.fn(() => ({
        createLocalWallet: mockCreateLocalWallet,
        createLedgerWallet: jest.fn(),
        createSmartWallet: jest.fn(),
    })),
    useDisclosure: jest.fn(() => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() })),
}))

jest.mock("~Storage/Redux", () => ({
    resetApp: jest.fn(() => ({ type: "reset-app" })),
    setIsAppLoading: jest.fn(value => ({ type: "set-loading", payload: value })),
    useAppDispatch: jest.fn(() => mockDispatch),
}))

jest.mock("~Storage", () => ({
    Keychain: {
        set: jest.fn(),
        get: jest.fn(),
        deleteItem: jest.fn(),
    },
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS: () => "Too many attempts",
            ERROR_CREATING_WALLET: () => "Error creating wallet",
            NOTIFICATION_AUTHENTICATION_CANCELLED: () => "Authentication cancelled",
        },
    })),
}))

jest.mock("~Services/HapticsService", () => ({
    triggerNotification: jest.fn(),
}))

/** Key-sensitive stand-in for AES: decrypting with a different key throws. */
const installKeySensitiveCipher = () => {
    jest.spyOn(CryptoUtils, "encrypt").mockImplementation(
        async (value, key) => `enc[${key}]${Buffer.from(JSON.stringify(value)).toString("hex")}`,
    )
    jest.spyOn(CryptoUtils, "decrypt").mockImplementation(async (value: string, key: string) => {
        const match = /^enc\[(.*?)\](.*)$/.exec(value)
        if (!match || match[1] !== key) throw new Error("Could not decrypt wallet")
        return JSON.parse(Buffer.from(match[2], "hex").toString())
    })
}

const cancelledPrompt = () => Object.assign(new Error("User canceled the operation"), { code: "-128" })
const keychainFailure = () => new Error("keychain unavailable")

const FAULT_POINTS = [
    { name: "minting the wallet key", slot: WALLET_SLOT, op: "set" as const },
    { name: "minting the storage key", slot: STORAGE_SLOT, op: "set" as const },
    { name: "reading the wallet key to encrypt the wallet", slot: WALLET_SLOT, op: "get" as const },
]

const FAULT_KINDS = [
    { name: "the user cancels the biometric prompt", error: cancelledPrompt, toast: "info" as const },
    { name: "the keychain fails", error: keychainFailure, toast: "error" as const },
]

describe("onboarding wallet creation under fault injection", () => {
    /** iOS Keychain / Android Keystore, keyed by slot. */
    let vault: Map<string, string>
    /** One-shot failures, consumed by the first matching keychain call. */
    let faults: Fault[]
    let nextAddress: number

    const takeFault = (slot: string, op: Fault["op"]) => {
        const index = faults.findIndex(fault => fault.slot === slot && fault.op === op)
        if (index === -1) return
        const [fault] = faults.splice(index, 1)
        throw fault.error
    }

    const decryptable = (device: FakeDevice) =>
        WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: device.wallet })

    /** Every wallet in state decrypts with the key currently in the keychain, or there is none. */
    const expectInvariant = async (devices: FakeDevice[]) => {
        for (const device of devices) {
            await expect(decryptable(device)).resolves.toMatchObject({ rootAddress: device.rootAddress })
        }
    }

    const createWallet = async (result: { current: ReturnType<typeof useHandleWalletCreation> }) => {
        await act(async () => {
            await result.current.onCreateWallet({ derivationPath: DerivationPath.VET })
        })
    }

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        resetOnboardingOperation()
        installKeySensitiveCipher()

        vault = new Map()
        faults = []
        nextAddress = 1
        mockState.walletStatus = WALLET_STATUS.FIRST_TIME_ACCESS
        mockState.devices = []
        mockState.committed = []
        mockState.committedKeys = undefined
        mockState.migrationFailure = undefined
        mockStore.getState = () => ({ devices: mockState.devices })
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ key, value }) => {
            takeFault(key, "set")
            vault.set(key, value)
        })
        ;(Keychain.get as jest.Mock).mockImplementation(async ({ key }) => {
            takeFault(key, "get")
            return vault.get(key) ?? null
        })
        ;(Keychain.deleteItem as jest.Mock).mockImplementation(async ({ key }) => {
            vault.delete(key)
        })

        // Mirrors useCreateWallet.createLocalWallet: encrypt with the CURRENT wallet key using
        // the real helper, then add the device to onboarding redux.
        mockCreateLocalWallet.mockImplementation(async ({ mnemonic }: { mnemonic?: string[] }) => {
            const rootAddress = `0x${(nextAddress++).toString(16).padStart(40, "0")}`
            const wallet = await WalletEncryptionKeyHelper.encryptWallet({ rootAddress, nonce: "0", mnemonic })
            mockState.devices.push({
                rootAddress,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                wallet,
                position: mockState.devices.length,
            })
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe.each(FAULT_POINTS)("when $name fails", point => {
        it.each(FAULT_KINDS)("because $name, the retry yields one wallet that decrypts", async kind => {
            faults.push({ slot: point.slot, op: point.op, error: kind.error() })
            const { result } = renderHook(() => useHandleWalletCreation())

            // ---- Attempt 1 fails -------------------------------------------------------------
            await createWallet(result)

            expect(mockMigrateOnboarding).not.toHaveBeenCalled()
            expect(mockState.committed).toHaveLength(0)
            // Nothing half-made is left behind for a retry to build on.
            expect(mockState.devices).toHaveLength(0)
            await expectInvariant(mockState.devices)
            if (kind.toast === "info") {
                expect(showInfoToast).toHaveBeenCalledTimes(1)
                expect(showErrorToast).not.toHaveBeenCalled()
            } else {
                expect(showErrorToast).toHaveBeenCalledTimes(1)
            }
            // The loader never stays up.
            expect(mockDispatch).toHaveBeenCalledWith({ type: "set-loading", payload: false })

            // ---- Attempt 2: the user taps again --------------------------------------------------
            await createWallet(result)

            expect(mockMigrateOnboarding).toHaveBeenCalledTimes(1)
            expect(mockState.committed).toHaveLength(1)
            await expectInvariant(mockState.committed)
            expect(vault.has(WALLET_SLOT)).toBe(true)
            expect(vault.has(STORAGE_SLOT)).toBe(true)
            expect(mockState.committedKeys).toBeDefined()
        })
    })

    it("rolls everything back when the migration itself fails, so the retry starts clean", async () => {
        mockState.migrationFailure = new Error("migration failed")
        const { result } = renderHook(() => useHandleWalletCreation())

        await createWallet(result)

        expect(mockState.committed).toHaveLength(0)
        expect(mockState.devices).toHaveLength(0)
        expect(showErrorToast).toHaveBeenCalledTimes(1)

        await createWallet(result)

        expect(mockState.committed).toHaveLength(1)
        await expectInvariant(mockState.committed)
    })

    it("never mints a key beside a wallet already in state: leftovers are cleared first", async () => {
        // A wallet from an interrupted attempt whose key is no longer in the keychain. It is
        // unfunded and unreachable, and it must not survive into the committed state.
        mockState.devices.push({
            rootAddress: "0x1111111111111111111111111111111111111111",
            type: DEVICE_TYPE.LOCAL_MNEMONIC,
            wallet: `enc[0xlost]${Buffer.from(JSON.stringify({ rootAddress: "0x11" })).toString("hex")}`,
            position: 0,
        })
        const { result } = renderHook(() => useHandleWalletCreation())

        await createWallet(result)

        expect(mockState.committed).toHaveLength(1)
        expect(mockState.committed[0].rootAddress).not.toBe("0x1111111111111111111111111111111111111111")
        await expectInvariant(mockState.committed)
    })

    it("refuses to run onboarding creation once the app is onboarded", async () => {
        // The onboarding handlers mint a fresh wallet key. Reaching them from an onboarded
        // state would rotate the key that protects the existing wallets, so they must refuse
        // before touching the keychain or redux.
        vault.set(WALLET_SLOT, JSON.stringify({ walletKey: "0xlive" }))
        vault.set(STORAGE_SLOT, JSON.stringify({ redux: "r", images: "i", metadata: "m" }))
        const existingAddress = "0x2222222222222222222222222222222222222222"
        const existing: FakeDevice = {
            rootAddress: existingAddress,
            type: DEVICE_TYPE.LOCAL_MNEMONIC,
            wallet: `enc[0xlive]${Buffer.from(
                JSON.stringify({ rootAddress: existingAddress, nonce: "0", mnemonic: ["a"] }),
            ).toString("hex")}`,
            position: 0,
        }
        mockState.devices.push(existing)
        mockState.walletStatus = WALLET_STATUS.UNLOCKED
        const { result } = renderHook(() => useHandleWalletCreation())

        await createWallet(result)

        expect(Keychain.set).not.toHaveBeenCalled()
        expect(Keychain.deleteItem).not.toHaveBeenCalled()
        expect(mockMigrateOnboarding).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalledWith({ type: "reset-app" })
        expect(showErrorToast).toHaveBeenCalledTimes(1)
        expect(vault.get(WALLET_SLOT)).toBe(JSON.stringify({ walletKey: "0xlive" }))
        await expectInvariant([existing])
    })
})
