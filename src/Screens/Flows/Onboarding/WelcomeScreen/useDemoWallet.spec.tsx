import { act, renderHook } from "@testing-library/react-hooks"
import React from "react"
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
    useApplicationSecurity: jest.fn(() => ({ migrateOnboarding: mockMigrateOnboarding })),
    useStore: jest.fn(() => ({ persistor: {} })),
    WalletEncryptionKeyHelper: {
        init: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
    },
}))

jest.mock("~Hooks", () => ({
    useCreateWallet: jest.fn(() => ({ createLocalWallet: mockCreateWallet })),
}))

jest.mock("~Storage/Redux", () => ({
    resetApp: jest.fn(() => ({ type: "reset-app" })),
    selectAreDevFeaturesEnabled: jest.fn(),
    setIsAppLoading: jest.fn(value => ({ type: "set-loading", payload: value })),
    useAppDispatch: jest.fn(() => mockDispatch),
    useAppSelector: jest.fn(() => true),
}))

jest.mock("~Utils", () => ({
    debug: jest.fn(),
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: { ERROR_CREATING_WALLET: jest.fn(() => "Error creating wallet") },
    })),
}))

describe("useDemoWallet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockMigrateOnboarding.mockResolvedValue(undefined)
    })

    it("shares one in-flight onboarding operation across repeated activations", async () => {
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

        expect(first).toBe(duplicate)
        expect(mockCreateWallet).toHaveBeenCalledTimes(1)

        releaseWalletCreation()
        await act(async () => {
            await Promise.all([first, duplicate])
        })

        expect(mockMigrateOnboarding).toHaveBeenCalledTimes(1)
    })
})
