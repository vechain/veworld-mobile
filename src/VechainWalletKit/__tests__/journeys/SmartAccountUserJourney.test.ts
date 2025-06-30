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

const setMockWallet = (address: string, providerResponse: string) => {
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
import { usePrivySmartAccountAdapter } from "../../adapters/usePrivySmartAccountAdapter"

/**
 * Smart Account User Journey Tests
 *
 * Tests that focus on user interaction flows with the Kit
 */

describe("Smart Account User Journey Tests", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        resetMockOAuth()
    })

    describe("New User First-Time Setup", () => {
        it("should complete full onboarding flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("new-user")
            setMockWallet("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

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

            // 3. User can access their account
            await act(async () => {
                const account = await result.current.getAccount()
                expect(account.address).toBeTruthy()
            })
        })
    })

    describe("Authentication Flow Management", () => {
        it("should handle login and logout flow", async () => {
            // Set up authenticated user for this test
            setAuthenticatedUser("test-user")
            setMockWallet("0x5555555555555555555555555555555555555555", "0xsignature")

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

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
            setMockWallet("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

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
            setMockWallet("0x5555555555555555555555555555555555555555", mockSignature)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

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

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow(
                "User not authenticated or no wallet available",
            )
        })

        it("should handle provider errors", async () => {
            // Set up authenticated user with provider that throws errors
            setAuthenticatedUser("test-user")
            setProviderError(new Error("Provider error"))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("Failed to sign message")
        })
    })
})
