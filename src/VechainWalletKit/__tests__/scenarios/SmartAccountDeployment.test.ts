import React from "react"
import { renderHook } from "@testing-library/react-native"
import { useSmartWallet } from "../../providers/SmartWalletProvider"
import { SmartWalletWithPrivyProvider } from "../../providers/SmartWalletWithPrivy"

// Mock VeChain SDK to support real buildSmartAccountTransaction function
jest.mock("@vechain/sdk-core", () => ({
    Address: {
        of: jest.fn().mockImplementation((address: string) => ({
            toString: () => address,
            toJSON: () => address,
        })),
    },
    Clause: {
        callFunction: jest.fn().mockImplementation((_contract, _func, _params) => ({
            to: "0x1234567890123456789012345678901234567890",
            value: "0",
            data: "0xmockeddata",
        })),
    },
    Transaction: {
        of: jest.fn().mockImplementation(() => ({
            getTransactionHash: jest.fn().mockReturnValue(Buffer.from("mockhash", "hex")),
            body: { clauses: [] },
        })),
    },
    ABIContract: {
        ofAbi: jest.fn().mockReturnValue({
            getFunction: jest.fn().mockReturnValue({
                selector: "0xmocked",
                encodeData: jest.fn().mockReturnValue("0xmockeddata"),
            }),
        }),
    },
}))

// Mock @vechain/sdk-network
jest.mock("@vechain/sdk-network", () => ({
    ThorClient: {
        at: jest.fn().mockReturnValue({
            gas: {
                estimateGas: jest.fn().mockResolvedValue({ totalGas: 21000 }),
            },
            transactions: {
                buildTransactionBody: jest.fn().mockReturnValue({
                    clauses: [],
                    gas: 21000,
                }),
            },
        }),
    },
}))

// Mock Privy SDK with configurable address
let mockUserAddress = "0x5555555555555555555555555555555555555555"

jest.mock("@privy-io/expo", () => ({
    PrivyProvider: ({ children }: { children: React.ReactNode }) => children,
    usePrivy: jest.fn(() => ({
        user: { id: "deployment-test-user" },
        logout: jest.fn(),
    })),
    useEmbeddedEthereumWallet: jest.fn(() => ({
        wallets: [
            {
                get address() {
                    return mockUserAddress
                },
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue("0xdeploymentsignature"),
                }),
            },
        ],
    })),
    useLoginWithOAuth: jest.fn(() => ({
        login: jest.fn(),
    })),
}))

// Helper to set mock address for different test scenarios
const setMockAddress = (address: string) => {
    mockUserAddress = address
}

// Mock useSmartAccount hook to return controlled smart account info
jest.mock("../../hooks/useSmartAccount", () => ({
    useSmartAccount: jest.fn(() => ({
        getSmartAccount: jest.fn().mockImplementation((address: string) => {
            // Return different smart account configs based on address
            if (address.includes("3333")) {
                return { address: "0x3333333333333333333333333333333333333333", isDeployed: false }
            } else if (address.includes("4444")) {
                return { address: "0x4444444444444444444444444444444444444444", isDeployed: true }
            } else if (address.includes("5555")) {
                return { address: "0x5555555555555555555555555555555555555555", isDeployed: true }
            } else {
                return { address: "0x6666666666666666666666666666666666666666", isDeployed: false }
            }
        }),
        hasV1SmartAccount: jest.fn().mockImplementation((address: string) => {
            // Address with 5555 is V1, others are V3
            return address.includes("5555")
        }),
        getSmartAccountVersion: jest.fn().mockImplementation((address: string) => {
            return address.includes("5555") ? 1 : 3
        }),
        getFactoryAddress: jest.fn().mockReturnValue("0xfactoryfactoryfactoryfactoryfactoryfa"),
    })),
}))

// Test configuration for SmartWalletWithPrivy
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

// Test wrapper using SmartWalletWithPrivyProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement(SmartWalletWithPrivyProvider, {
        config: testConfig,
        children,
    })
}

/**
 * Smart Account Deployment Tests
 *
 * Tests the real buildSmartAccountTransaction function behavior
 * with different smart account deployment states and versions.
 */
describe("Smart Account Deployment", () => {
    beforeEach(() => {
        // Reset to default address
        setMockAddress("0x5555555555555555555555555555555555555555")
    })

    describe("Transaction Building Based on Deployment Status", () => {
        it("should build transaction for undeployed V3 smart accounts", async () => {
            // Set address that will return undeployed V3 config
            setMockAddress("0x3333333333333333333333333333333333333333")

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            const txClauses = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "1000000000000000000",
                    data: "0x",
                },
            ]

            const transaction = await result.current.buildTransaction(txClauses)

            expect(transaction).toBeDefined()
            expect(transaction.getTransactionHash).toBeDefined()
            expect(typeof transaction.getTransactionHash).toBe("function")
        })

        it("should build transaction for already deployed smart accounts", async () => {
            // Set address that will return deployed V3 config
            setMockAddress("0x4444444444444444444444444444444444444444")

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            const txClauses = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "1000000000000000000",
                    data: "0x",
                },
            ]

            const transaction = await result.current.buildTransaction(txClauses)

            expect(transaction).toBeDefined()
            expect(transaction.getTransactionHash).toBeDefined()
            expect(typeof transaction.getTransactionHash).toBe("function")
        })

        it("should build transaction for V1 smart account transactions", async () => {
            // Set address that will return V1 config
            setMockAddress("0x5555555555555555555555555555555555555555")

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            const txClauses = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "1000000000000000000",
                    data: "0x",
                },
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "2000000000000000000",
                    data: "0x",
                },
            ]

            const transaction = await result.current.buildTransaction(txClauses)

            expect(transaction).toBeDefined()
            expect(transaction.getTransactionHash).toBeDefined()
            expect(typeof transaction.getTransactionHash).toBe("function")
        })

        it("should build transaction for V3 smart account transactions", async () => {
            // Set address that will return undeployed V3 config
            setMockAddress("0x6666666666666666666666666666666666666666")

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            const txClauses = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "1000000000000000000",
                    data: "0x",
                },
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "2000000000000000000",
                    data: "0x",
                },
            ]

            const transaction = await result.current.buildTransaction(txClauses)

            expect(transaction).toBeDefined()
            expect(transaction.getTransactionHash).toBeDefined()
            expect(typeof transaction.getTransactionHash).toBe("function")
        })
    })
})
