import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { SmartWalletAuthGate } from "./SmartWalletAuthGate"
import { TestWrapper, setPlatform } from "~Test"
import { DEVICE_TYPE, WALLET_STATUS } from "~Model"
import { useWalletStatus } from "~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { RootState } from "~Storage/Redux/Types"

jest.mock("~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider", () => ({
    ...jest.requireActual("~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"),
    useWalletStatus: jest.fn(),
}))

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(),
}))

jest.mock("~Hooks/useSetSelectedAccount", () => ({
    useSetSelectedAccount: jest.fn(),
}))

const mockLogin = jest.fn()
const mockOnSetSelectedAccount = jest.fn()

const SMART_ROOT = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const SMART_ADDRESS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
const LOCAL_ROOT = "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0"
const LOCAL_ADDRESS = "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"

const smartDevice = {
    alias: "Smart Wallet",
    index: 0,
    rootAddress: SMART_ROOT,
    type: DEVICE_TYPE.SMART_WALLET,
    position: 0,
    linkedProviders: ["google"] as ("google" | "apple")[],
}

const localDevice = {
    alias: "Local Wallet",
    index: 0,
    rootAddress: LOCAL_ROOT,
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    xPub: {
        chainCode: "x77777777",
        publicKey: "04999999999999",
    },
    wallet: JSON.stringify({
        mnemonic: "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" "),
        rootAddress: LOCAL_ROOT,
        nonce: "nonce",
    }),
    position: 1,
}

const buildState = (overrides?: {
    selectedAccount?: string
    accounts?: any[]
    devices?: any[]
}): Partial<RootState> => ({
    accounts: {
        accounts: overrides?.accounts ?? [
            {
                address: SMART_ADDRESS,
                alias: "Smart Account",
                index: 0,
                rootAddress: SMART_ROOT,
                visible: true,
            },
            {
                address: LOCAL_ADDRESS,
                alias: "Account 1",
                index: 0,
                rootAddress: LOCAL_ROOT,
                visible: true,
            },
        ],
        selectedAccount: overrides?.selectedAccount ?? SMART_ADDRESS,
    },
    devices: overrides?.devices ?? [smartDevice, localDevice],
    balances: { mainnet: {}, testnet: {}, other: {}, solo: {} },
})

const setupMocks = ({
    walletStatus = WALLET_STATUS.UNLOCKED,
    isAuthenticated = false,
    isReady = true,
}: {
    walletStatus?: WALLET_STATUS
    isAuthenticated?: boolean
    isReady?: boolean
} = {}) => {
    ;(useWalletStatus as jest.Mock).mockReturnValue(walletStatus)
    ;(useSmartWallet as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated,
        isReady,
    })
    ;(useSetSelectedAccount as jest.Mock).mockReturnValue({
        onSetSelectedAccount: mockOnSetSelectedAccount,
    })
}

const renderGate = (preloadedState: Partial<RootState>) =>
    render(
        <TestWrapper preloadedState={preloadedState}>
            <SmartWalletAuthGate />
        </TestWrapper>,
    )

describe("SmartWalletAuthGate", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setPlatform("ios")
    })

    describe("gate visibility", () => {
        it("does not render when walletStatus is FIRST_TIME_ACCESS", () => {
            setupMocks({ walletStatus: WALLET_STATUS.FIRST_TIME_ACCESS })
            renderGate(buildState())
            expect(screen.queryByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeNull()
        })

        it("does not render when wallet is locked", () => {
            setupMocks({ walletStatus: WALLET_STATUS.LOCKED })
            renderGate(buildState())
            expect(screen.queryByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeNull()
        })

        it("does not render when selected account is not a smart wallet", () => {
            setupMocks()
            renderGate(
                buildState({
                    selectedAccount: LOCAL_ADDRESS,
                    accounts: [
                        {
                            address: LOCAL_ADDRESS,
                            alias: "Account 1",
                            index: 0,
                            rootAddress: LOCAL_ROOT,
                            visible: true,
                        },
                    ],
                    devices: [localDevice],
                }),
            )
            expect(screen.queryByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeNull()
        })

        it("does not render when smart wallet is not ready", () => {
            setupMocks({ isReady: false })
            renderGate(buildState())
            expect(screen.queryByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeNull()
        })

        it("does not render when already authenticated", () => {
            setupMocks({ isAuthenticated: true })
            renderGate(buildState())
            expect(screen.queryByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeNull()
        })

        it("renders overlay when unlocked, smart account selected, ready, and not authenticated", () => {
            setupMocks()
            renderGate(buildState())
            expect(screen.getByTestId("RELOGIN_SMART_ACCOUNT_CARD")).toBeTruthy()
        })
    })

    describe("provider buttons", () => {
        it("shows only Google button when linkedProviders is ['google']", () => {
            setupMocks()
            renderGate(buildState())
            expect(screen.getByTestId("RELOGIN_GOOGLE_BUTTON")).toBeTruthy()
            expect(screen.queryByTestId("RELOGIN_APPLE_BUTTON")).toBeNull()
        })

        it("shows only Apple button on iOS when linkedProviders is ['apple']", () => {
            setupMocks()
            const devices = [{ ...smartDevice, linkedProviders: ["apple"] }, localDevice]
            renderGate(buildState({ devices }))
            expect(screen.getByTestId("RELOGIN_APPLE_BUTTON")).toBeTruthy()
            expect(screen.queryByTestId("RELOGIN_GOOGLE_BUTTON")).toBeNull()
        })

        it("shows both buttons on iOS when linkedProviders is empty (fallback)", () => {
            setupMocks()
            const devices = [{ ...smartDevice, linkedProviders: [] }, localDevice]
            renderGate(buildState({ devices }))
            expect(screen.getByTestId("RELOGIN_GOOGLE_BUTTON")).toBeTruthy()
            expect(screen.getByTestId("RELOGIN_APPLE_BUTTON")).toBeTruthy()
        })

        it("hides Apple button on Android even when linkedProviders includes apple", () => {
            setPlatform("android")
            setupMocks()
            const devices = [{ ...smartDevice, linkedProviders: ["apple", "google"] }, localDevice]
            renderGate(buildState({ devices }))
            expect(screen.queryByTestId("RELOGIN_APPLE_BUTTON")).toBeNull()
            expect(screen.getByTestId("RELOGIN_GOOGLE_BUTTON")).toBeTruthy()
        })
    })

    describe("login calls", () => {
        it("calls login with google provider when Google button pressed", () => {
            setupMocks()
            renderGate(buildState())
            fireEvent.press(screen.getByTestId("RELOGIN_GOOGLE_BUTTON"))
            expect(mockLogin).toHaveBeenCalledWith({
                provider: "google",
                oauthRedirectUri: "/auth/callback",
            })
        })

        it("calls login with apple provider when Apple button pressed", () => {
            setupMocks()
            const devices = [{ ...smartDevice, linkedProviders: ["apple"] }, localDevice]
            renderGate(buildState({ devices }))
            fireEvent.press(screen.getByTestId("RELOGIN_APPLE_BUTTON"))
            expect(mockLogin).toHaveBeenCalledWith({
                provider: "apple",
                oauthRedirectUri: "/auth/callback",
            })
        })
    })

    describe("alternative wallet switch", () => {
        it("shows alternative wallets section when non-smart accounts exist", () => {
            setupMocks()
            renderGate(buildState())
            expect(screen.getAllByTestId("RELOGIN_ACCOUNT_CARD").length).toBeGreaterThan(0)
        })

        it("hides alternative wallets section when no non-smart accounts exist", () => {
            setupMocks()
            renderGate(
                buildState({
                    accounts: [
                        {
                            address: SMART_ADDRESS,
                            alias: "Smart Account",
                            index: 0,
                            rootAddress: SMART_ROOT,
                            visible: true,
                        },
                    ],
                    devices: [smartDevice],
                }),
            )
            expect(screen.queryByTestId("RELOGIN_ACCOUNT_CARD")).toBeNull()
        })

        it("calls onSetSelectedAccount with correct address when alternative account pressed", () => {
            setupMocks()
            renderGate(buildState())
            fireEvent.press(screen.getAllByTestId("RELOGIN_ACCOUNT_CARD")[0])
            expect(mockOnSetSelectedAccount).toHaveBeenCalledWith({ address: LOCAL_ADDRESS })
        })
    })
})
