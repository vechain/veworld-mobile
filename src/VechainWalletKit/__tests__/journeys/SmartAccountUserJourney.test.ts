import { renderHook, act } from "@testing-library/react-native"
import { usePrivySmartAccountAdapter } from "../../adapters/PrivySmartAccountAdapter"

/**
 * Smart Account User Journey Tests
 *
 * Simplified tests that focus on user interaction flows without calling
 * VeChain SDK functions that create BigInt serialization issues.
 */

describe("Smart Account User Journey Tests", () => {
    describe("New User First-Time Setup", () => {
        it("should complete full onboarding flow", async () => {
            // Mock authenticated user state
            const mockOAuth = { login: jest.fn() }
            const mockPrivy = {
                user: { id: "new-user" },
                logout: jest.fn(),
            }
            const mockWallets = {
                wallets: [
                    {
                        address: "0x5555555555555555555555555555555555555555",
                        getProvider: jest.fn().mockResolvedValue({
                            request: jest.fn().mockResolvedValue("0xsignature"),
                        }),
                    },
                ],
            }

            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => mockPrivy),
                useEmbeddedEthereumWallet: jest.fn(() => mockWallets),
                useLoginWithOAuth: jest.fn(() => mockOAuth),
            }))

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

            expect(mockOAuth.login).toHaveBeenCalled()

            // 3. User can access their account
            await act(async () => {
                const account = await result.current.getAccount()
                expect(account.address).toBeTruthy()
            })
        })
    })

    describe("Authentication Flow Management", () => {
        it("should handle login and logout flow", async () => {
            const mockOAuth = { login: jest.fn() }
            const mockPrivy = {
                user: { id: "test-user" },
                logout: jest.fn(),
            }
            const mockWallets = {
                wallets: [
                    {
                        address: "0x5555555555555555555555555555555555555555",
                        getProvider: jest.fn().mockResolvedValue({
                            request: jest.fn().mockResolvedValue("0xsignature"),
                        }),
                    },
                ],
            }

            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => mockPrivy),
                useEmbeddedEthereumWallet: jest.fn(() => mockWallets),
                useLoginWithOAuth: jest.fn(() => mockOAuth),
            }))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            // Test login functionality
            await act(async () => {
                await result.current.login({
                    provider: "google",
                    oauthRedirectUri: "app://callback",
                })
            })

            expect(mockOAuth.login).toHaveBeenCalledWith({
                provider: "google",
                redirectUri: "app://callback",
            })

            // Test logout functionality
            await act(async () => {
                await result.current.logout()
            })

            expect(mockPrivy.logout).toHaveBeenCalled()
        })
    })

    describe("Message Signing Flow", () => {
        it("should handle message signing requests", async () => {
            const mockProvider = {
                request: jest.fn().mockResolvedValue("0xsignature123"),
            }
            const mockPrivy = {
                user: { id: "test-user" },
                logout: jest.fn(),
            }
            const mockWallets = {
                wallets: [
                    {
                        address: "0x5555555555555555555555555555555555555555",
                        getProvider: jest.fn().mockResolvedValue(mockProvider),
                    },
                ],
            }

            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => mockPrivy),
                useEmbeddedEthereumWallet: jest.fn(() => mockWallets),
                useLoginWithOAuth: jest.fn(() => ({ login: jest.fn() })),
            }))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const message = Buffer.from("Please sign this message", "utf8")

            await act(async () => {
                const signature = await result.current.signMessage(message)
                expect(signature).toBeInstanceOf(Buffer)
                expect(signature.length).toBeGreaterThan(0)
            })

            expect(mockProvider.request).toHaveBeenCalledWith({
                method: "personal_sign",
                params: [expect.stringContaining("0x"), "0x5555555555555555555555555555555555555555"],
            })
        })
    })

    describe("Typed Data Signing Flow", () => {
        it("should handle typed data signing", async () => {
            const mockProvider = {
                request: jest.fn().mockResolvedValue("0xtypeddatasignature"),
            }
            const mockPrivy = {
                user: { id: "test-user" },
                logout: jest.fn(),
            }
            const mockWallets = {
                wallets: [
                    {
                        address: "0x5555555555555555555555555555555555555555",
                        getProvider: jest.fn().mockResolvedValue(mockProvider),
                    },
                ],
            }

            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => mockPrivy),
                useEmbeddedEthereumWallet: jest.fn(() => mockWallets),
                useLoginWithOAuth: jest.fn(() => ({ login: jest.fn() })),
            }))

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
                expect(signature).toBe("0xtypeddatasignature")
            })

            expect(mockProvider.request).toHaveBeenCalledWith({
                method: "eth_signTypedData_v4",
                params: ["0x5555555555555555555555555555555555555555", expect.any(String)],
            })
        })
    })

    describe("Error Handling Scenarios", () => {
        it("should handle authentication errors", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            // Mock unauthenticated state
            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => ({ user: null, logout: jest.fn() })),
                useEmbeddedEthereumWallet: jest.fn(() => ({ wallets: [] })),
                useLoginWithOAuth: jest.fn(() => ({ login: jest.fn() })),
            }))

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow(
                "User not authenticated or no wallet available",
            )
        })

        it("should handle provider errors", async () => {
            const mockProvider = {
                request: jest.fn().mockRejectedValue(new Error("Provider error")),
            }
            const mockPrivy = {
                user: { id: "test-user" },
                logout: jest.fn(),
            }
            const mockWallets = {
                wallets: [
                    {
                        address: "0x5555555555555555555555555555555555555555",
                        getProvider: jest.fn().mockResolvedValue(mockProvider),
                    },
                ],
            }

            jest.doMock("@privy-io/expo", () => ({
                usePrivy: jest.fn(() => mockPrivy),
                useEmbeddedEthereumWallet: jest.fn(() => mockWallets),
                useLoginWithOAuth: jest.fn(() => ({ login: jest.fn() })),
            }))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const message = Buffer.from("Test message", "utf8")

            await expect(result.current.signMessage(message)).rejects.toThrow("Failed to sign message")
        })
    })
})
