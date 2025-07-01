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

// Dynamic mock system for useSmartAccount hook
let mockSmartAccountState = {
    getSmartAccount: jest.fn().mockResolvedValue({
        address: "0x1111111111111111111111111111111111111111",
        isDeployed: false,
    }),
    hasV1SmartAccount: jest.fn().mockResolvedValue(false),
    getSmartAccountVersion: jest.fn().mockResolvedValue(2),
    getFactoryAddress: jest.fn().mockReturnValue("0xFactoryAddress123456789012345678901234567890"),
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

const setMockPrivyProviderResp = (address: string, providerResponse: string) => {
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

// Helper functions for Smart Account mock state
const setGetMockSmartAccountResp = (address: string, isDeployed: boolean) => {
    mockSmartAccountState = {
        ...mockSmartAccountState,
        getSmartAccount: jest.fn().mockResolvedValue({
            address,
            isDeployed,
        }),
    }
}

const setSmartAccountVersion = (version: number) => {
    mockSmartAccountState = {
        ...mockSmartAccountState,
        getSmartAccountVersion: jest.fn().mockResolvedValue(version),
    }
}

const setHasV1SmartAccount = (hasV1: boolean) => {
    mockSmartAccountState = {
        ...mockSmartAccountState,
        hasV1SmartAccount: jest.fn().mockResolvedValue(hasV1),
    }
}

const resetMockSmartAccount = () => {
    mockSmartAccountState = {
        getSmartAccount: jest.fn().mockResolvedValue({
            address: "0x1111111111111111111111111111111111111111",
            isDeployed: false,
        }),
        hasV1SmartAccount: jest.fn().mockResolvedValue(false),
        getSmartAccountVersion: jest.fn().mockResolvedValue(2),
        getFactoryAddress: jest.fn().mockReturnValue("0xFactoryAddress123456789012345678901234567890"),
    }
}

import { renderHook, act, waitFor } from "@testing-library/react-native"
import React from "react"
import { useSmartWallet } from "../../providers/SmartWalletProvider"
import { SmartWalletWithPrivyProvider } from "../../providers/SmartWalletWithPrivy"

/**
 * Smart Account Tests with SmartWalletWithPrivyProvider
 *
 * Tests that focus on user interaction flows using the full SmartWalletWithPrivyProvider wrapper
 * This provides coverage for the complete integration including usePrivyExpoAdapter
 */

// Test configuration for SmartWalletWithPrivyProvider
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

// Custom wrapper component for testing that uses SmartWalletWithPrivyProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement(SmartWalletWithPrivyProvider, {
        config: testConfig,
        children,
    })
}

describe("SmartWalletWithPrivyProvider Tests", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        resetMockOAuth()
        resetMockSmartAccount()
    })

    describe("New smart account First-Time Setup", () => {
        it("should complete full onboarding flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("new-user")
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", "0xsignature")
            setGetMockSmartAccountResp("0x1111111111111111111111111111111111111111", true)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            // Init the wallet
            await act(async () => {
                await result.current.initialiseWallet()
            })

            // Wait for async state updates to complete
            await waitFor(() => result.current.isLoading === false)

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
            expect(result.current.smartAccountAddress).toBeTruthy()
        })

        it("should handle deployed smart account", async () => {
            // Example of using smart account helper functions
            setAuthenticatedUser("user-with-deployed-account")
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", "0xsignature")
            setGetMockSmartAccountResp("0x1111111111111111111111111111111111111111", true)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
            })

            // Wait for async state updates to complete
            await waitFor(() => result.current.isLoading === false)

            expect(result.current.isAuthenticated).toBe(true)
        })

        it("should handle V1 smart account migration", async () => {
            // Test legacy account scenario
            setAuthenticatedUser("user-with-v1-account")
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", "0xsignature")
            setHasV1SmartAccount(true)
            setSmartAccountVersion(1)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
            })

            // Wait for async state updates to complete
            await waitFor(() => result.current.isLoading === false)

            expect(result.current.isAuthenticated).toBe(true)
        })

        it("should handle custom smart account address", async () => {
            // Test custom smart account address
            setAuthenticatedUser("user-with-custom-account")
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", "0xsignature")
            setGetMockSmartAccountResp("0x9999999999999999999999999999999999999999", false)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
            })

            // Wait for async state updates to complete
            await waitFor(() => result.current.isLoading === false)

            expect(result.current.isAuthenticated).toBe(true)
        })
    })

    describe("Authentication Flow Management", () => {
        it("should handle login and logout flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("test-user")
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
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
        it("should sign a message with Privy wallet provider", async () => {
            // Set up authenticated user with specific provider response
            setAuthenticatedUser("test-user")

            // Short valid hex signature for testing
            const mockSignature = "0x1234abcd5678ef90"
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
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
            setMockPrivyProviderResp("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
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
        it("should throw an error if the user is not authenticated", async () => {
            // Set up unauthenticated user for this test
            setUnauthenticatedUser()
            setEmptyWallets()

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("User not authenticated")
        })

        it("should handle provider errors", async () => {
            // Set up authenticated user with provider that throws errors
            setAuthenticatedUser("test-user")
            setProviderError(new Error("Provider error"))

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            await act(async () => {
                await result.current.initialiseWallet()
            })

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("Failed to sign message")
        })
    })
})
