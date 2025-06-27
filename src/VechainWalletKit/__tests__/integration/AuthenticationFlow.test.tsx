import React from "react"
import { renderHook, waitFor, act } from "@testing-library/react-native"
import { VechainWalletProvider, useVechainWallet } from "../../providers/VechainWalletProvider"
import { VechainWalletSDKConfig } from "../../types/config"
import { createMockAdapter, createFailingAdapter } from "../helpers/mockAdapters"

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

describe("Authentication Flow Integration (Direct Hook Testing)", () => {
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
    const createWrapper = (adapter: any, config = mockConfig) => {
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

    describe("Initial Authentication State", () => {
        it("should start in unauthenticated state", () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.address).toBe("")
            expect(result.current.isDeployed).toBe(false)
        })

        it("should start in authenticated state if adapter is already authenticated", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.address).toBe(mockAddress)
                expect(result.current.isDeployed).toBe(false)
            })
        })
    })

    describe("Login Flow", () => {
        it("should handle successful Google login", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({ isAuthenticated: false })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Initially not authenticated
            expect(result.current.isAuthenticated).toBe(false)

            // Simulate successful login
            adapter.login.mockImplementation(async () => {
                adapter.setAuthenticated(true)
                adapter.setAccount({
                    address: mockAddress,
                    isDeployed: false,
                })
            })

            // Trigger login
            await act(async () => {
                await result.current.login({
                    provider: "google",
                    oauthRedirectUri: "test://callback",
                })
            })

            // Verify login was called with correct parameters
            expect(adapter.login).toHaveBeenCalledWith({
                provider: "google",
                oauthRedirectUri: "test://callback",
            })
        })

        it("should handle successful Apple login", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await act(async () => {
                await result.current.login({
                    provider: "apple",
                    oauthRedirectUri: "test://callback",
                })
            })

            expect(adapter.login).toHaveBeenCalledWith({
                provider: "apple",
                oauthRedirectUri: "test://callback",
            })
        })

        it("should handle successful Discord login", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await act(async () => {
                await result.current.login({
                    provider: "discord",
                    oauthRedirectUri: "test://callback",
                })
            })

            expect(adapter.login).toHaveBeenCalledWith({
                provider: "discord",
                oauthRedirectUri: "test://callback",
            })
        })

        it("should handle login failure gracefully", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            adapter.login.mockRejectedValue(new Error("Login failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Should not throw
            await act(async () => {
                try {
                    await result.current.login({
                        provider: "google",
                        oauthRedirectUri: "test://callback",
                    })
                } catch (error) {
                    // Expected to fail
                }
            })

            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe("Logout Flow", () => {
        it("should handle successful logout", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Wait for initial authenticated state
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.address).toBe(mockAddress)
            })

            // Simulate logout
            adapter.logout.mockImplementation(async () => {
                adapter.setAuthenticated(false)
                adapter.setAccount({ address: "", isDeployed: false })
            })

            // Trigger logout
            await act(async () => {
                await result.current.logout()
            })

            expect(adapter.logout).toHaveBeenCalled()
        })

        it("should handle logout failure gracefully", async () => {
            const adapter = createMockAdapter({ isAuthenticated: true })
            adapter.logout.mockRejectedValue(new Error("Logout failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Should not throw
            await act(async () => {
                try {
                    await result.current.logout()
                } catch (error) {
                    // Expected to fail
                }
            })

            expect(adapter.logout).toHaveBeenCalled()
        })
    })

    describe("Authentication State Transitions", () => {
        it("should update state when adapter authentication changes externally", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Initially not authenticated
            expect(result.current.isAuthenticated).toBe(false)

            // Simulate external authentication change
            await act(async () => {
                adapter.setAuthenticated(true)
                adapter.setAccount({
                    address: "0x1234567890123456789012345678901234567890",
                    isDeployed: false,
                })
            })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })
        })

        it("should handle account fetch failure after login", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            adapter.login.mockImplementation(async () => {
                adapter.setAuthenticated(true)
                // Don't set account to simulate failure
            })
            adapter.getAccount.mockRejectedValue(new Error("Account fetch failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await act(async () => {
                try {
                    await result.current.login({
                        provider: "google",
                        oauthRedirectUri: "test://callback",
                    })
                } catch (error) {
                    // May throw due to account fetch failure
                }
            })

            expect(adapter.login).toHaveBeenCalled()
        })
    })

    describe("Smart Account Integration During Authentication", () => {
        it("should fetch smart account info after successful authentication", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: "0xSmartAccountAddress",
                isDeployed: true,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.isDeployed).toBe(true)
            })

            expect(mockSmartAccount.getSmartAccount).toHaveBeenCalledWith(mockAddress)
        })

        it("should handle smart account fetch failure during authentication", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            mockSmartAccount.getSmartAccount.mockRejectedValue(new Error("Smart account fetch failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Should gracefully handle smart account failure
            expect(result.current.isDeployed).toBe(false)
        })
    })

    describe("Complete Authentication Lifecycle", () => {
        it("should handle complete login -> use -> logout flow", async () => {
            const adapter = createMockAdapter({ isAuthenticated: false })
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // 1. Start unauthenticated
            expect(result.current.isAuthenticated).toBe(false)

            // 2. Login
            adapter.login.mockImplementation(async () => {
                adapter.setAuthenticated(true)
                adapter.setAccount({
                    address: "0x1234567890123456789012345678901234567890",
                    isDeployed: false,
                })
            })

            await act(async () => {
                await result.current.login({
                    provider: "google",
                    oauthRedirectUri: "test://callback",
                })
            })

            // 3. Should be authenticated
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // 4. Logout
            adapter.logout.mockImplementation(async () => {
                adapter.setAuthenticated(false)
                adapter.setAccount({ address: "", isDeployed: false })
            })

            await act(async () => {
                await result.current.logout()
            })

            // 5. Should be unauthenticated again
            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe("Error Recovery", () => {
        it("should recover from adapter errors and continue functioning", async () => {
            const adapter = createFailingAdapter()
            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            // Should start in safe default state
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.address).toBe("")

            // Should not crash when operations fail
            await act(async () => {
                try {
                    await result.current.login({
                        provider: "google",
                        oauthRedirectUri: "test://callback",
                    })
                } catch (error) {
                    // Expected to fail
                }
            })

            // Should remain functional
            expect(result.current.isAuthenticated).toBe(false)
        })
    })
})
