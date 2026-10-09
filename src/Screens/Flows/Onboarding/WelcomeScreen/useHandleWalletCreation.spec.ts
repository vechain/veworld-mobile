import { act, renderHook } from "@testing-library/react-hooks"
import { DerivationPath } from "~Constants"
import { SecurityLevelType } from "~Model"
import { resetApp } from "~Storage/Redux"
import { showErrorToast, showInfoToast, StorageEncryptionKeyHelper, WalletEncryptionKeyHelper } from "~Components"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

const mockDispatch = jest.fn()
const mockCreateLocalWallet = jest.fn()
const mockMigrateOnboarding = jest.fn()
const STORAGE_KEYS = { redux: "redux-key", images: "images-key", metadata: "metadata-key" }

jest.mock("~Components", () => ({
    runOnboardingOperationOnce: jest.fn((operation: () => Promise<void>) => operation()),
    runOnboardingStorageMigration: jest.fn((_persistor: unknown, migration: () => Promise<void>) => migration()),
    showErrorToast: jest.fn(),
    showInfoToast: jest.fn(),
    useApplicationSecurity: jest.fn(() => ({
        migrateOnboarding: mockMigrateOnboarding,
        walletStatus: "FIRST_TIME_ACCESS",
    })),
    useStore: jest.fn(() => ({ persistor: {}, store: { getState: () => ({ devices: [] }) } })),
    WalletEncryptionKeyHelper: {
        init: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
    },
    StorageEncryptionKeyHelper: {
        init: jest.fn().mockResolvedValue({ redux: "redux-key", images: "images-key", metadata: "metadata-key" }),
        remove: jest.fn().mockResolvedValue(undefined),
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

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS: jest.fn(() => "Too many attempts"),
            ERROR_CREATING_WALLET: jest.fn(() => "Error creating wallet"),
            NOTIFICATION_AUTHENTICATION_CANCELLED: jest.fn(() => "Authentication cancelled"),
        },
    })),
}))

jest.mock("~Services/HapticsService", () => ({
    triggerNotification: jest.fn(),
}))

describe("useHandleWalletCreation", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateLocalWallet.mockResolvedValue(undefined)
        ;(WalletEncryptionKeyHelper.remove as jest.Mock).mockResolvedValue(undefined)
        ;(StorageEncryptionKeyHelper.remove as jest.Mock).mockResolvedValue(undefined)
        ;(StorageEncryptionKeyHelper.init as jest.Mock).mockResolvedValue(STORAGE_KEYS)
    })

    it("mints both keys before the wallet exists and hands the storage keys to the migration", async () => {
        const { result } = renderHook(() => useHandleWalletCreation())

        await act(async () => {
            await result.current.onCreateWallet({ derivationPath: DerivationPath.VET })
        })

        const walletKeyMinted = (WalletEncryptionKeyHelper.init as jest.Mock).mock.invocationCallOrder[0]
        const storageKeyMinted = (StorageEncryptionKeyHelper.init as jest.Mock).mock.invocationCallOrder[0]
        const walletCreated = mockCreateLocalWallet.mock.invocationCallOrder[0]
        expect(walletKeyMinted).toBeLessThan(storageKeyMinted)
        expect(storageKeyMinted).toBeLessThan(walletCreated)
        expect(mockMigrateOnboarding).toHaveBeenCalledWith(SecurityLevelType.BIOMETRIC, STORAGE_KEYS)
    })

    it("shows an error before rolling back a failed onboarding migration", async () => {
        const failure = new Error("migration failed")
        mockMigrateOnboarding.mockRejectedValueOnce(failure)
        const { result } = renderHook(() => useHandleWalletCreation())

        await act(async () => {
            await result.current.onCreateWallet({ derivationPath: DerivationPath.VET })
        })

        expect(showErrorToast).toHaveBeenCalledTimes(1)
        expect(WalletEncryptionKeyHelper.remove).toHaveBeenCalledTimes(1)
        expect(StorageEncryptionKeyHelper.remove).toHaveBeenCalledTimes(1)
        expect(resetApp).toHaveBeenCalledTimes(1)
        expect(mockDispatch).toHaveBeenCalledWith({ type: "reset-app" })
        expect((showErrorToast as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (resetApp as unknown as jest.Mock).mock.invocationCallOrder[0],
        )
    })

    it("rolls back to nothing when the user cancels the biometric prompt, and says so", async () => {
        // iOS keychain user-cancel error shape (BiometricErrors.IOS_CANCEL). Keeping state here
        // is what let a retry mint a new key over a wallet already in state.
        const cancel = Object.assign(new Error("user canceled the operation"), { code: "-128" })
        mockCreateLocalWallet.mockRejectedValueOnce(cancel)
        const { result } = renderHook(() => useHandleWalletCreation())

        await act(async () => {
            await result.current.onCreateWallet({ derivationPath: DerivationPath.VET })
        })

        expect(WalletEncryptionKeyHelper.remove).toHaveBeenCalledTimes(1)
        expect(StorageEncryptionKeyHelper.remove).toHaveBeenCalledTimes(1)
        expect(resetApp).toHaveBeenCalledTimes(1)
        expect(mockMigrateOnboarding).not.toHaveBeenCalled()
        expect(showErrorToast).not.toHaveBeenCalled()
        expect(showInfoToast).toHaveBeenCalledTimes(1)
        // the loader is still cleared
        expect(mockDispatch).toHaveBeenCalledWith({ type: "set-loading", payload: false })
    })

    it("handles the migration error and resets Redux when wallet-key cleanup fails", async () => {
        const failure = new Error("migration failed")
        mockMigrateOnboarding.mockRejectedValueOnce(failure)
        ;(WalletEncryptionKeyHelper.remove as jest.Mock).mockRejectedValueOnce(new Error("keychain cleanup failed"))
        const { result } = renderHook(() => useHandleWalletCreation())

        await act(async () => {
            await result.current.onCreateWallet({ derivationPath: DerivationPath.VET })
        })

        expect(resetApp).toHaveBeenCalledTimes(1)
        expect(mockDispatch).toHaveBeenCalledWith({ type: "reset-app" })
        expect(showErrorToast).toHaveBeenCalledTimes(1)
    })
})
