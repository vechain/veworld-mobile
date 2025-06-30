import { renderHook } from "@testing-library/react-native"
import { usePrivySmartAccountAdapter } from "./usePrivySmartAccountAdapter"
import { WalletError, WalletErrorType } from "../utils/errors"

// Mock VeChain Transaction
const mockTransaction = {
    getTransactionHash: jest.fn(),
}

// Mock modules
jest.mock("@vechain/sdk-core", () => ({
    Transaction: jest.fn(),
    Address: {
        of: jest.fn(),
    },
    ABIContract: {
        ofAbi: jest.fn(),
    },
    Clause: {
        callFunction: jest.fn(),
    },
}))

jest.mock("viem", () => ({
    encodeFunctionData: jest.fn(),
    bytesToHex: jest.fn(),
}))

// Dynamic mock state for different test scenarios
let mockUserState: {
    user: { id: string } | null
    logout: jest.MockedFunction<() => void>
} = {
    user: { id: "test-user" },
    logout: jest.fn(),
}

let mockWalletState = {
    wallets: [
        {
            address: "0x1234567890123456789012345678901234567890",
            getProvider: jest.fn().mockResolvedValue({
                request: jest.fn().mockResolvedValue("0xmocksignature"),
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

// Helper functions to set mock states
const setAuthenticatedUser = () => {
    mockUserState = {
        user: { id: "test-user" },
        logout: jest.fn(),
    }
}

const setUnauthenticatedUser = () => {
    mockUserState = {
        user: null,
        logout: jest.fn(),
    }
}

const setMockWalletWithProvider = (providerResponse: string) => {
    mockWalletState = {
        wallets: [
            {
                address: "0x1234567890123456789012345678901234567890",
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
                address: "0x1234567890123456789012345678901234567890",
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockRejectedValue(error),
                }),
            },
        ],
    }
}

describe("usePrivySmartAccountAdapter", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset to default authenticated state
        setAuthenticatedUser()
        setMockWalletWithProvider("0xmocksignature")
        mockTransaction.getTransactionHash.mockReturnValue("0xabcdef123456")
    })

    describe("signTransaction", () => {
        it("should successfully sign a transaction with proper signature format", async () => {
            // Mock a complete signature with r, s, v components (65 bytes total = 130 hex chars)
            const mockSignatureResponse =
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" +
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"
            setMockWalletWithProvider(mockSignatureResponse)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const signature = await result.current.signTransaction(mockTransaction as any)

            expect(signature).toBeInstanceOf(Buffer)
            expect(signature.length).toBe(65) // 65 bytes for r + s + v

            // Verify provider was called with correct method and hash
            const mockWallet = mockWalletState.wallets[0]
            const mockProvider = await mockWallet.getProvider()
            expect(mockProvider.request).toHaveBeenCalledWith({
                method: "secp256k1_sign",
                params: ["0xabcdef123456"],
            })

            // Verify transaction hash was retrieved
            expect(mockTransaction.getTransactionHash).toHaveBeenCalled()
        })

        it("should process signature format correctly - v adjustment from 27 to 0", async () => {
            // Mock signature with v = 27 (should be adjusted to 0)
            const mockSignatureResponse =
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" +
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"
            setMockWalletWithProvider(mockSignatureResponse)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const signature = await result.current.signTransaction(mockTransaction as any)

            // The last byte should be 0 (27 - 27 = 0)
            const signatureHex = signature.toString("hex")
            expect(signatureHex.slice(-2)).toBe("00") // v should be adjusted to 00
        })

        it("should process signature format correctly - v adjustment from 28 to 1", async () => {
            // Mock signature with v = 28 (should be adjusted to 1)
            const mockSignatureResponse =
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" +
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c"
            setMockWalletWithProvider(mockSignatureResponse)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const signature = await result.current.signTransaction(mockTransaction as any)

            // The last byte should be 1 (28 - 27 = 1)
            const signatureHex = signature.toString("hex")
            expect(signatureHex.slice(-2)).toBe("01") // v should be adjusted to 01
        })

        it("should handle signature format with v values that don't need adjustment", async () => {
            // Mock signature with v = 0 (should remain 0)
            const mockSignatureResponse =
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" +
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00"
            setMockWalletWithProvider(mockSignatureResponse)

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const signature = await result.current.signTransaction(mockTransaction as any)

            // The last byte should remain 0
            const signatureHex = signature.toString("hex")
            expect(signatureHex.slice(-2)).toBe("00") // v should remain 00
        })

        it("should throw error when user is not authenticated", async () => {
            setUnauthenticatedUser()

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(WalletError)
            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(
                "User not authenticated or no wallet available",
            )
        })

        it("should throw error when no wallets are available", async () => {
            setAuthenticatedUser()
            setEmptyWallets()

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(WalletError)
            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(
                "User not authenticated or no wallet available",
            )
        })

        it("should throw error when provider request fails", async () => {
            setAuthenticatedUser()
            setProviderError(new Error("Provider signing failed"))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(WalletError)
            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(
                "Failed to sign transaction",
            )
        })

        it("should handle provider request rejection gracefully", async () => {
            setAuthenticatedUser()
            setProviderError(new Error("User rejected the transaction"))

            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            await expect(result.current.signTransaction(mockTransaction as any)).rejects.toThrow(WalletError)

            // Verify the error type is correct
            try {
                await result.current.signTransaction(mockTransaction as any)
            } catch (error) {
                expect(error).toBeInstanceOf(WalletError)
                expect((error as WalletError).type).toBe(WalletErrorType.SIGNATURE_REJECTED)
            }
        })
    })
})
