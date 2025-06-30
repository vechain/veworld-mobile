// Dynamic mock system for controlling user state per test
let mockUserState: {
    user: { id: string } | null
    logout: jest.MockedFunction<() => void>
} = {
    user: { id: "default-test-user" },
    logout: jest.fn(),
}

let mockWalletState = {
    wallets: [
        {
            address: "0x5555555555555555555555555555555555555555",
            getProvider: jest.fn().mockResolvedValue({
                request: jest.fn().mockResolvedValue("0xdefaultsignature"),
            }),
        },
    ],
}

let mockOAuthState = {
    login: jest.fn(),
}

// Mock Privy SDK with dynamic state
jest.mock("@privy-io/expo", () => ({
    usePrivy: jest.fn(() => mockUserState),
    useEmbeddedEthereumWallet: jest.fn(() => mockWalletState),
    useLoginWithOAuth: jest.fn(() => mockOAuthState),
    // Mock PrivyProvider to simply render children
    PrivyProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Helper functions to set different mock states
const setAuthenticatedUser = (userId: string) => {
    mockUserState = {
        user: { id: userId },
        logout: jest.fn(),
    }
}

const setUnauthenticatedUser = () => {
    mockUserState = {
        user: null,
        logout: jest.fn(),
    }
}

const setMockWalletProviderResponse = (address: string, providerResponse: string) => {
    mockWalletState = {
        wallets: [
            {
                address,
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue(providerResponse),
                }),
            },
        ],
    }
}

const setEmptyWallets = () => {
    mockWalletState = {
        wallets: [],
    }
}

const setProviderError = (error: Error) => {
    mockWalletState = {
        wallets: [
            {
                address: "0x5555555555555555555555555555555555555555",
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockRejectedValue(error),
                }),
            },
        ],
    }
}

const resetMockOAuth = () => {
    mockOAuthState = {
        login: jest.fn(),
    }
}

import { renderHook, act } from "@testing-library/react-native"
import React from "react"
import { VechainWalletWithPrivy } from "../../providers/VechainWalletWithPrivy"
import { useVechainWallet } from "../../providers/VechainWalletProvider"

/**
 * Smart Account User Journey Tests with VechainWalletWithPrivy
 *
 * Tests that focus on user interaction flows using the full VechainWalletWith
 Privy wrapper
 * This provides coverage for the complete integration including PrivyProvider
 */

// Test configuration for VechainWalletWithPrivy
const testConfig = {
    providerConfig: {
        appId: "test-app-id",
        clientId: "test-client-id",
    },
    networkConfig: {
        nodeUrl: "https://testnet.vechain.org",
        networkType: "testnet" as const,
    },
}

// Custom wrapper component for testing that uses VechainWalletWithPrivy
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement(VechainWalletWithPrivy, {
        config: testConfig,
        children,
    })
}

describe("Smart Account User Journey Tests with VechainWalletWithPrivy", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        resetMockOAuth()
    })

    describe("New User First-Time Setup", () => {
        it("should complete full onboarding flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("new-user")
            setMockWalletProviderResponse("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            // 1. User starts authenticated
            expect(result.current.isAuthenticated).toBe(true)

            // 2. User can perform login flow
            await act(async () => {
                await result.current.login({
                    provider: "google",
                    oauthRedirectUri: "app://callback",
                })
            })

            expect(mockOAuthState.login).toHaveBeenCalled()

            // 3. User can access their account address
            expect(result.current.address).toBeTruthy()
        })
    })

    describe("Authentication Flow Management", () => {
        it("should handle login and logout flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("test-user")
            setMockWalletProviderResponse("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            // Test login functionality
            await act(async () => {
                await result.current.login({
                    provider: "google",
                    oauthRedirectUri: "app://callback",
                })
            })

            expect(mockOAuthState.login).toHaveBeenCalledWith({
                provider: "google",
                redirectUri: "app://callback",
            })

            // Test logout functionality
            await act(async () => {
                await result.current.logout()
            })

            expect(mockUserState.logout).toHaveBeenCalled()
        })
    })

    describe("Message Signing Flow", () => {
        it("should handle message signing requests", async () => {
            // Set up authenticated user with specific provider response
            setAuthenticatedUser("test-user")

            // Short valid hex signature for testing
            const mockSignature = "0x1234abcd5678ef90"
            setMockWalletProviderResponse("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            const message = Buffer.from("Please sign this message", "utf8")

            await act(async () => {
                const signature = await result.current.signMessage(message)
                expect(signature).toBeInstanceOf(Buffer)
                expect(signature.length).toBe(8) // 8 bytes for our test signature
                expect(signature.toString("hex")).toBe(mockSignature.slice(2)) // Without 0x prefix
            })

            const mockWallet = mockWalletState.wallets[0]
            const mockProvider = await mockWallet.getProvider()
            expect(mockProvider.request).toHaveBeenCalledWith({
                method: "personal_sign",
                params: [expect.stringContaining("0x"), "0x5555555555555555555555555555555555555555"],
            })
        })
    })

    describe("Typed Data Signing Flow", () => {
        it("should handle typed data signing", async () => {
            // Set up authenticated user with specific provider response
            setAuthenticatedUser("test-user")

            // Short valid hex signature for testing
            const mockSignature = "0xabcd1234ef567890"
            setMockWalletProviderResponse("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            const typedData = {
                domain: {
                    name: "Test Domain",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0x1234567890123456789012345678901234567890",
                },
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" },
                    ],
                    TestMessage: [{ name: "message", type: "string" }],
                },
                message: {
                    message: "Hello, World!",
                },
            }

            await act(async () => {
                const signature = await result.current.signTypedData(typedData)
                expect(signature).toBe(mockSignature)
            })

            const mockWallet = mockWalletState.wallets[0]
            const mockProvider = await mockWallet.getProvider()
            expect(mockProvider.request).toHaveBeenCalledWith({
                method: "eth_signTypedData_v4",
                params: ["0x5555555555555555555555555555555555555555", expect.any(String)],
            })
        })
    })

    describe("Error Handling Scenarios", () => {
        it("should handle authentication errors", async () => {
            // Set up unauthenticated user for this test
            setUnauthenticatedUser()
            setEmptyWallets()

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("User not authenticated")
        })

        it("should handle provider errors", async () => {
            // Set up authenticated user with provider that throws errors
            setAuthenticatedUser("test-user")
            setProviderError(new Error("Provider error"))

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("Failed to sign message")
        })
    })

    describe("VechainWalletWithPrivy Integration", () => {
        it("should initialize with proper Privy configuration", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("integration-test-user")
            setMockWalletProviderResponse("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            // Verify the wallet context is properly initialized
            expect(result.current.isAuthenticated).toBe(true)

            // Wait for the address to be set asynchronously
            await act(async () => {
                // Trigger any async operations by calling a method
                await new Promise(resolve => setTimeout(resolve, 0))
            })

            expect(result.current.address).toBeTruthy()
            expect(typeof result.current.signMessage).toBe("function")
            expect(typeof result.current.signTransaction).toBe("function")
            expect(typeof result.current.signTypedData).toBe("function")
            expect(typeof result.current.buildTransaction).toBe("function")
            expect(typeof result.current.login).toBe("function")
            expect(typeof result.current.logout).toBe("function")
        })

        it("should handle full provider configuration", () => {
            // This test verifies that the VechainWalletWithPrivy component
            // properly passes through the configuration to both PrivyProvider and VechainWalletProvider

            // Since we're mocking PrivyProvider to just render children,
            // we can verify the component renders without errors
            const { result } = renderHook(() => useVechainWallet(), {
                wrapper: TestWrapper,
            })

            expect(result.current).toBeDefined()
            expect(typeof result.current.isAuthenticated).toBe("boolean")
        })
    })
})
