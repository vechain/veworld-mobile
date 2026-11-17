import { act, renderHook } from "@testing-library/react-hooks"
// The real helpers, imported past the mocked ~Components barrel.
import {
    resetOnboardingOperation,
    runOnboardingOperationOnce,
    runOnboardingStorageMigration,
    StorageEncryptionKeyHelper,
    WalletEncryptionKeyHelper,
} from "~Components/Providers/EncryptedStorageProvider/Helpers"
import { DerivationPath } from "~Constants"
import { DEVICE_TYPE, IMPORT_TYPE, NewLedgerDevice } from "~Model"
import { Keychain } from "~Storage"
import { CryptoUtils } from "~Utils"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

/**
 * Invariant under test, for an app that is already onboarded: adding a wallet of any kind
 * never writes or deletes a wallet or storage key. The new wallet is encrypted with the key
 * already in the keychain and every wallet that existed before still decrypts afterwards.
 *
 * The onboarding handlers are the only code that mints a wallet key, and minting one beside
 * an existing wallet orphans it. This spec pins that the add-wallet handlers stay on the
 * read-only side of that line, for a biometric user and for a PIN user whose device also has
 * biometrics enrolled.
 */

const WALLET_KEY = "0xwallet-key-minted-at-onboarding"
const PIN = "111111"
const KEY_SLOTS = [
    "WALLET_BIOMETRIC_KEY_STORAGE",
    "WALLET_ENCRYPTION_KEY_STORAGE",
    "BIOMETRIC_KEY_STORAGE",
    "ENCRYPTION_KEY_STORAGE",
]
const MNEMONIC = "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" ")
const PRIVATE_KEY = "0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"

type FakeDevice = { rootAddress: string; type: DEVICE_TYPE; wallet?: string; position: number }

const mockState = {
    securityLevel: "BIOMETRIC" as "BIOMETRIC" | "NONE",
    devices: [] as FakeDevice[],
}

const mockDispatch = jest.fn()
const mockMigrateOnboarding = jest.fn()
const mockCreateLocalWallet = jest.fn()
const mockCreateSmartWallet = jest.fn()
const mockCreateLedgerWallet = jest.fn()
const mockPersistor = { flush: jest.fn().mockResolvedValue(undefined), pause: jest.fn(), persist: jest.fn() }
const mockStore = { getState: () => ({ devices: mockState.devices }) }

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
    useApplicationSecurity: () => ({ migrateOnboarding: mockMigrateOnboarding, walletStatus: "UNLOCKED" }),
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
    useBiometrics: () => ({ currentSecurityLevel: mockState.securityLevel }),
    useCreateWallet: () => ({
        createLocalWallet: mockCreateLocalWallet,
        createLedgerWallet: mockCreateLedgerWallet,
        createSmartWallet: mockCreateSmartWallet,
    }),
    useDisclosure: () => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() }),
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

const PROFILES = [
    { name: "a biometric user", securityLevel: "BIOMETRIC" as const, pin: undefined },
    { name: "a PIN user on a device with biometrics enrolled", securityLevel: "BIOMETRIC" as const, pin: PIN },
    { name: "a PIN user on a device without biometrics", securityLevel: "NONE" as const, pin: PIN },
]

describe("adding a wallet once onboarded never touches the keys", () => {
    /** iOS Keychain / Android Keystore, keyed by slot. */
    let vault: Map<string, string>
    let nextAddress: number

    const newAddress = () => `0x${(nextAddress++).toString(16).padStart(40, "0")}`

    const decryptable = (device: FakeDevice, pin?: string) =>
        WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: device.wallet ?? "", pinCode: pin })

    /** Keys and one wallet, exactly as a completed onboarding leaves them. */
    const seedOnboardedUser = async (pin?: string) => {
        await WalletEncryptionKeyHelper.set({ walletKey: WALLET_KEY }, pin)
        await StorageEncryptionKeyHelper.set(
            { redux: "redux-key", images: "images-key", metadata: "metadata-key" },
            pin,
        )

        const rootAddress = newAddress()
        const wallet = await WalletEncryptionKeyHelper.encryptWallet(
            { rootAddress, nonce: "0", mnemonic: MNEMONIC },
            pin,
        )
        mockState.devices.push({ rootAddress, type: DEVICE_TYPE.LOCAL_MNEMONIC, wallet, position: 0 })

        // Only writes made by the handlers under test count from here on.
        ;(Keychain.set as jest.Mock).mockClear()
        ;(Keychain.deleteItem as jest.Mock).mockClear()
    }

    const keySlotsOf = (mock: jest.Mock) =>
        mock.mock.calls.map(([args]) => args.key as string).filter(key => KEY_SLOTS.includes(key))

    const expectKeysUntouched = async (snapshot: Map<string, string>, pin?: string) => {
        expect(WalletEncryptionKeyHelper.init).not.toHaveBeenCalled()
        expect(StorageEncryptionKeyHelper.init).not.toHaveBeenCalled()
        expect(keySlotsOf(Keychain.set as jest.Mock)).toEqual([])
        expect(Keychain.deleteItem).not.toHaveBeenCalled()
        expect(mockMigrateOnboarding).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalledWith({ type: "reset-app" })
        for (const slot of KEY_SLOTS) {
            expect(vault.get(slot)).toBe(snapshot.get(slot))
        }
        // Every local wallet, old and new, still decrypts with the original key.
        for (const device of mockState.devices) {
            if (device.type !== DEVICE_TYPE.LOCAL_MNEMONIC && device.type !== DEVICE_TYPE.LOCAL_PRIVATE_KEY) continue
            await expect(decryptable(device, pin)).resolves.toMatchObject({ rootAddress: device.rootAddress })
        }
    }

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        resetOnboardingOperation()
        installKeySensitiveCipher()
        jest.spyOn(WalletEncryptionKeyHelper, "init")
        jest.spyOn(StorageEncryptionKeyHelper, "init")

        vault = new Map()
        nextAddress = 1
        mockState.devices = []
        mockStore.getState = () => ({ devices: mockState.devices })
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ key, value }) => {
            vault.set(key, value)
        })
        ;(Keychain.get as jest.Mock).mockImplementation(async ({ key }) => vault.get(key) ?? null)
        ;(Keychain.deleteItem as jest.Mock).mockImplementation(async ({ key }) => {
            vault.delete(key)
        })

        // Mirrors useCreateWallet: encrypt with the key already in the keychain, then add.
        mockCreateLocalWallet.mockImplementation(
            async ({
                mnemonic,
                privateKey,
                userPassword,
            }: {
                mnemonic?: string[]
                privateKey?: string
                userPassword?: string
            }) => {
                const rootAddress = newAddress()
                const wallet = await WalletEncryptionKeyHelper.encryptWallet(
                    { rootAddress, nonce: "0", mnemonic, privateKey },
                    userPassword,
                )
                mockState.devices.push({
                    rootAddress,
                    type: privateKey ? DEVICE_TYPE.LOCAL_PRIVATE_KEY : DEVICE_TYPE.LOCAL_MNEMONIC,
                    wallet,
                    position: mockState.devices.length,
                })
            },
        )
        mockCreateSmartWallet.mockImplementation(async ({ address }: { address: string }) => {
            mockState.devices.push({
                rootAddress: address,
                type: DEVICE_TYPE.SMART_WALLET,
                position: mockState.devices.length,
            })
        })
        mockCreateLedgerWallet.mockImplementation(async () => {
            mockState.devices.push({
                rootAddress: newAddress(),
                type: DEVICE_TYPE.LEDGER,
                position: mockState.devices.length,
            })
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe.each(PROFILES)("for $name", profile => {
        beforeEach(async () => {
            mockState.securityLevel = profile.securityLevel
            await seedOnboardedUser(profile.pin)
        })

        it("creating a new wallet", async () => {
            const snapshot = new Map(vault)
            const { result } = renderHook(() => useHandleWalletCreation())

            await act(async () => {
                await result.current.createOnboardedWallet({ pin: profile.pin, derivationPath: DerivationPath.VET })
            })

            expect(mockState.devices).toHaveLength(2)
            await expectKeysUntouched(snapshot, profile.pin)
        })

        it("importing a recovery phrase", async () => {
            const snapshot = new Map(vault)
            const { result } = renderHook(() => useHandleWalletCreation())

            await act(async () => {
                await result.current.importOnboardedWallet({
                    importMnemonic: MNEMONIC,
                    pin: profile.pin,
                    derivationPath: DerivationPath.VET,
                    importType: IMPORT_TYPE.MNEMONIC,
                })
            })

            expect(mockState.devices).toHaveLength(2)
            await expectKeysUntouched(snapshot, profile.pin)
        })

        it("importing a private key", async () => {
            const snapshot = new Map(vault)
            const { result } = renderHook(() => useHandleWalletCreation())

            await act(async () => {
                await result.current.importOnboardedWallet({
                    privateKey: PRIVATE_KEY,
                    pin: profile.pin,
                    derivationPath: DerivationPath.VET,
                    importType: IMPORT_TYPE.PRIVATE_KEY,
                })
            })

            expect(mockState.devices).toHaveLength(2)
            expect(mockState.devices[1].type).toBe(DEVICE_TYPE.LOCAL_PRIVATE_KEY)
            await expectKeysUntouched(snapshot, profile.pin)
        })

        it("adding a social smart wallet", async () => {
            const snapshot = new Map(vault)
            const { result } = renderHook(() => useHandleWalletCreation())

            await act(async () => {
                await result.current.importOnboardedSmartWallet({ address: newAddress(), name: "Smart" })
            })

            expect(mockState.devices).toHaveLength(2)
            await expectKeysUntouched(snapshot, profile.pin)
        })

        it("adding a ledger", async () => {
            const snapshot = new Map(vault)
            const disconnectLedger = jest.fn().mockResolvedValue(undefined)
            const { result } = renderHook(() => useHandleWalletCreation())

            await act(async () => {
                await result.current.importLedgerWallet({
                    newLedger: { deviceId: "ledger-1", alias: "Ledger", accounts: [0] } as unknown as NewLedgerDevice,
                    disconnectLedger,
                })
            })

            expect(mockState.devices).toHaveLength(2)
            expect(disconnectLedger).toHaveBeenCalledTimes(1)
            await expectKeysUntouched(snapshot, profile.pin)
        })
    })
})
