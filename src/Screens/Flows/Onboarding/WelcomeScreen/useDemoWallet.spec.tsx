import { act, renderHook } from "@testing-library/react-hooks"
import React from "react"
import { resetOnboardingOperation } from "~Components/Providers/EncryptedStorageProvider/Helpers/OnboardingOperation"
import { SecurityLevelType } from "~Model"
import { useDemoWallet } from "./useDemoWallet"

const mockDispatch = jest.fn()
const mockCreateWallet = jest.fn()
const mockMigrateOnboarding = jest.fn()

jest.mock("~Components", () => ({
    BaseButton: jest.fn(() => null),
    runOnboardingOperationOnce: jest.requireActual(
        "~Components/Providers/EncryptedStorageProvider/Helpers/OnboardingOperation",
    ).runOnboardingOperationOnce,
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
    useBiometrics: jest.fn(() => ({ currentSecurityLevel: "NONE" })),
    useCreateWallet: jest.fn(() => ({
        createLocalWallet: mockCreateWallet,
        createLedgerWallet: jest.fn(),
        createSmartWallet: jest.fn(),
    })),
    useDisclosure: jest.fn(() => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() })),
}))

jest.mock("~Services/HapticsService", () => ({ triggerNotification: jest.fn() }))

jest.mock("~Storage/Redux", () => ({
    resetApp: jest.fn(() => ({ type: "reset-app" })),
    selectAreDevFeaturesEnabled: jest.fn(),
    setIsAppLoading: jest.fn(value => ({ type: "set-loading", payload: value })),
    useAppDispatch: jest.fn(() => mockDispatch),
    useAppSelector: jest.fn(() => true),
}))

jest.mock("~Utils", () => ({
    debug: jest.fn(),
    error: jest.fn(),
    BiometricsUtils: {
        BiometricErrors: {
            isBiometricCanceled: jest.fn(() => false),
            isBiometricTooManyAttempts: jest.fn(() => false),
        },
    },
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            ERROR_CREATING_WALLET: jest.fn(() => "Error creating wallet"),
            ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS: jest.fn(() => "Too many attempts"),
            NOTIFICATION_AUTHENTICATION_CANCELLED: jest.fn(() => "Authentication cancelled"),
        },
    })),
}))

describe("useDemoWallet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockMigrateOnboarding.mockResolvedValue(undefined)
    })

    afterEach(() => {
        resetOnboardingOperation()
    })

    it("runs the onboarding once when the demo button is tapped repeatedly", async () => {
        let releaseWalletCreation!: () => void
        mockCreateWallet.mockImplementationOnce(
            () =>
                new Promise<void>(resolve => {
                    releaseWalletCreation = resolve
                }),
        )
        const { result } = renderHook(() => useDemoWallet())
        const button = result.current as React.ReactElement<{ action: () => Promise<void> }>

        let first!: Promise<void>
        let duplicate!: Promise<void>
        await act(async () => {
            first = button.props.action()
            duplicate = button.props.action()
            await Promise.resolve()
        })

        // The duplicate tap is a no-op that resolves without starting a second run.
        await expect(duplicate).resolves.toBeUndefined()
        expect(mockCreateWallet).toHaveBeenCalledTimes(1)

        releaseWalletCreation()
        await act(async () => {
            await first
        })

        expect(mockMigrateOnboarding).toHaveBeenCalledTimes(1)
        // Both keys are minted with the demo PIN before the wallet exists; the migration
        // receives the storage keys rather than minting them itself.
        expect(mockMigrateOnboarding).toHaveBeenCalledWith(SecurityLevelType.SECRET, {
            redux: "redux-key",
            images: "images-key",
            metadata: "metadata-key",
        })
    })
})
