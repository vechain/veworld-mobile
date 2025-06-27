import React from "react"
import { renderHook, waitFor, act } from "@testing-library/react-native"
import { VechainWalletProvider, useVechainWallet } from "../../providers/VechainWalletProvider"
import { VechainWalletSDKConfig } from "../../types/config"
import { WalletAdapter } from "../../types/wallet"
import { createMockAdapter } from "../helpers/mockAdapters"

// Mock ThorClient
const mockThorClient = {
    gas: {
        estimateGas: jest.fn().mockResolvedValue({
            totalGas: 21000,
        }),
    },
    transactions: {
        buildTransactionBody: jest.fn().mockResolvedValue({
            chainTag: 39,
            blockRef: "0x00000000aabbccdd",
            expiration: 32,
            clauses: [],
            gasPriceCoef: 0,
            gas: 21000,
            dependsOn: null,
            nonce: "0x12345678",
        }),
    },
}

// Mock smart account hook
const mockSmartAccount = {
    getSmartAccount: jest.fn(),
    hasV1SmartAccount: jest.fn(),
    getSmartAccountVersion: jest.fn(),
    getFactoryAddress: jest.fn(() => "0xFactoryAddress"),
}

// Mock external dependencies
jest.mock("@vechain/sdk-network", () => ({
    ThorClient: {
        at: jest.fn(() => mockThorClient),
    },
}))

jest.mock("../../hooks/useSmartAccount", () => ({
    useSmartAccount: jest.fn(() => mockSmartAccount),
}))

jest.mock("../../utils/transactionBuilder", () => ({
    buildSmartWalletTransactionClauses: jest.fn().mockResolvedValue([]),
}))

describe("VechainWalletProvider Integration (Direct Hook Testing)", () => {
    const mockConfig: VechainWalletSDKConfig = {
        networkConfig: {
            nodeUrl: "https://testnet.vechain.org",
            networkType: "testnet",
        },
        providerConfig: {
            appId: "test-app-id",
        },
    }

    // Helper to create wrapper with provider
    const createWrapper = (adapter: WalletAdapter, config = mockConfig) => {
        return ({ children }: { children: React.ReactNode }) => (
            <VechainWalletProvider config={config} adapter={adapter}>
                {children}
            </VechainWalletProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset smart account mocks
        mockSmartAccount.getSmartAccount.mockResolvedValue({
            address: "0xSmartAccountAddress",
            isDeployed: false,
        })
        mockSmartAccount.hasV1SmartAccount.mockResolvedValue(false)
        mockSmartAccount.getSmartAccountVersion.mockResolvedValue(2)
    })

    describe("Provider Setup and Initialization", () => {
        it("should provide initial wallet state when adapter is not authenticated", () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)

            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            expect(result.current.address).toBe("")
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.isDeployed).toBe(false)
        })

        it("should initialize with authenticated state when adapter is authenticated", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })
            const wrapper = createWrapper(adapter)

            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.address).toBe(mockAddress)
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.isDeployed).toBe(false)
            })
        })

        it("should handle smart account deployment status correctly", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: true },
            })

            // Mock smart account as deployed
            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: "0xSmartAccountAddress",
                isDeployed: true,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isDeployed).toBe(true)
            })
        })

        it("should throw error when useVechainWallet is used outside provider", () => {
            expect(() => {
                renderHook(() => useVechainWallet())
            }).toThrow("useVechainWallet must be used within a VechainWalletProvider")
        })
    })

    describe("Authentication State Management", () => {
        it("should handle authentication errors gracefully", async () => {
            const adapter = createMockAdapter({ isAuthenticated: true })
            adapter.getAccount.mockRejectedValue(new Error("Authentication failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.address).toBe("")
                expect(result.current.isAuthenticated).toBe(false)
            })
        })
    })

    describe("Wallet Operations", () => {
        it("should delegate login to adapter", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const mockAddress = "0x1234567890123456789012345678901234567890"

            adapter.login.mockResolvedValue({
                address: mockAddress,
                isDeployed: false,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await act(async () => {
                await result.current.login({ provider: "google", oauthRedirectUri: "test" })
            })

            expect(adapter.login).toHaveBeenCalledWith({
                provider: "google",
                oauthRedirectUri: "test",
            })
        })

        it("should delegate logout to adapter and clear state", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await act(async () => {
                await result.current.logout()
            })

            expect(adapter.logout).toHaveBeenCalled()
        })

        it("should delegate message signing to adapter", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const mockSignature = Buffer.from("signature")
            adapter.signMessage.mockResolvedValue(mockSignature)

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            const message = Buffer.from("test")
            let signature: Buffer | null = null

            await act(async () => {
                signature = await result.current.signMessage(message)
            })

            expect(adapter.signMessage).toHaveBeenCalledWith(message)
            expect(signature).toEqual(mockSignature)
        })
    })

    describe("Configuration Validation", () => {
        it("should work with mainnet configuration", () => {
            const mainnetConfig: VechainWalletSDKConfig = {
                networkConfig: {
                    nodeUrl: "https://mainnet.vechain.org",
                    networkType: "mainnet",
                },
                providerConfig: {
                    appId: "test-app-id",
                },
            }

            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter, mainnetConfig)

            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            expect(result.current.isAuthenticated).toBe(false)
        })

        it("should work with testnet configuration", () => {
            const testnetConfig: VechainWalletSDKConfig = {
                networkConfig: {
                    nodeUrl: "https://testnet.vechain.org",
                    networkType: "testnet",
                },
                providerConfig: {
                    appId: "test-app-id",
                },
            }

            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter, testnetConfig)

            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe("Error Handling", () => {
        it("should handle adapter errors without crashing", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Should not crash and maintain default state
            expect(result.current.address).toBe("")
            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe("Smart Account Integration", () => {
        it("should fetch smart account info on authentication", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.address).toBe(mockAddress)
            })

            expect(mockSmartAccount.getSmartAccount).toHaveBeenCalledWith(mockAddress)
        })
    })
})
