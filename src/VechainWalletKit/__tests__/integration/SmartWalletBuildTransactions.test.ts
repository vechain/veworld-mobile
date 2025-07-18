import React from "react"
import { renderHook, act } from "@testing-library/react-native"
import { useSmartWallet } from "../../providers/SmartWalletProvider"
import { SmartWalletWithPrivyProvider } from "../../providers/SmartWalletWithPrivy"

// Mock VeChain SDK
jest.mock("@vechain/sdk-core", () => {
    const actualSdkCore = jest.requireActual("@vechain/sdk-core")
    return {
        ...actualSdkCore,
        Address: {
            of: jest.fn().mockImplementation((address: string) => ({
                toString: () => address,
                toJSON: () => address,
            })),
        },
        Transaction: {
            of: jest.fn().mockImplementation(() => ({
                getTransactionHash: jest.fn().mockReturnValue(Buffer.from("mockhash", "hex")),
                body: { clauses: [] },
            })),
        },
    }
})

// Create mock contract methods that can be configured per test
let mockGetAccountAddress: jest.Mock = jest.fn()
let mockHasLegacyAccount: jest.Mock = jest.fn()
let mockVersion: jest.Mock = jest.fn()
let mockGetAccount: jest.Mock = jest.fn()

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
            contracts: {
                load: jest.fn().mockReturnValue({
                    read: {
                        getAccountAddress: jest.fn().mockImplementation((...args) => mockGetAccountAddress(...args)),
                        hasLegacyAccount: jest.fn().mockImplementation((...args) => mockHasLegacyAccount(...args)),
                        version: jest.fn().mockImplementation((...args) => mockVersion(...args)),
                    },
                }),
            },
            accounts: {
                getAccount: jest.fn().mockImplementation((...args) => mockGetAccount(...args)),
            },
        }),
    },
}))

// Get reference to the mocked function after the mock is defined
const { ThorClient } = require("@vechain/sdk-network")
const mockBuildTransactionBody = ThorClient.at().transactions.buildTransactionBody

// Mock Privy SDK with configurable address
let mockEmbeddedAddress = "0x5555555555555555555555555555555555555555"

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
                    return mockEmbeddedAddress
                },
                getProvider: jest.fn().mockResolvedValue({
                    request: jest
                        .fn()
                        .mockResolvedValue("0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1b"),
                }),
            },
        ],
        create: jest.fn().mockResolvedValue(undefined),
    })),
    useLoginWithOAuth: jest.fn(() => ({
        login: jest.fn(),
    })),
}))

// Helper to set mock address for different test scenarios
const setMockPrivyEmbeddedAddress = (address: string) => {
    mockEmbeddedAddress = address
}

// Helper functions to configure smart account behavior for tests
const setupSmartAccountContractResponses = (config: {
    smartAccountAddress: string
    isDeployed: boolean
    hasV1Account: boolean
    version: number
}) => {
    // Mock the contract factory calls
    mockGetAccountAddress.mockResolvedValue([config.smartAccountAddress])
    mockHasLegacyAccount.mockResolvedValue([config.hasV1Account])
    mockVersion.mockResolvedValue([config.version.toString()])

    // Mock the account deployment check
    mockGetAccount.mockResolvedValue({
        hasCode: config.isDeployed,
    })
}

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
 * Smart Account Transaction Building Tests
 *
 */
describe("Building transactions for smart accounts", () => {
    beforeEach(() => {
        // Reset mock calls between tests
        mockBuildTransactionBody.mockClear()
        mockGetAccountAddress.mockClear()
        mockHasLegacyAccount.mockClear()
        mockVersion.mockClear()
        mockGetAccount.mockClear()
    })

    describe("Transaction Building Based on Deployment Status", () => {
        it("should build transaction for undeployed V3 smart account", async () => {
            // Set up test scenario: undeployed V3 smart account
            setMockPrivyEmbeddedAddress("0x3333333333333333333333333333333333333333")
            setupSmartAccountContractResponses({
                smartAccountAddress: "0x3333333333333333333333333333333333333333",
                isDeployed: false,
                hasV1Account: false,
                version: 3,
            })

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            // Initialize the wallet first
            await act(async () => {
                await result.current.initialiseWallet()
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

            await act(async () => {
                await result.current.buildTransaction(txClauses)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(2) // deployment + batch execution of 2 clauses

            // First clause should be deployment (createAccount)
            expect(actualClauses[0].to).toBe("0x713b908bcf77f3e00efef328e50b657a1a23aeaf") // factory address (testnet)
            expect(actualClauses[0].data).toContain("0x5fbfb9cf") // createAccount function selector

            // Second clause should be batch execution (using correct address from explicit mock)
            expect(actualClauses[1].to).toBe("0x3333333333333333333333333333333333333333")
            expect(actualClauses[1].data).toContain("0x14a38c94") // executeBatchWithCustomAuthorization selector
        })

        it("should build transaction for already deployed V3 smart account", async () => {
            // Set up test scenario: already deployed V3 smart account
            setMockPrivyEmbeddedAddress("0x4444444444444444444444444444444444444444")
            setupSmartAccountContractResponses({
                smartAccountAddress: "0x4444444444444444444444444444444444444444",
                isDeployed: true,
                hasV1Account: false,
                version: 3,
            })

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            // Initialize the wallet first
            await act(async () => {
                await result.current.initialiseWallet()
            })

            const txClauses = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "1000000000000000000",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(txClauses)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(1) // only batch execution, no deployment needed

            // Should be batch execution only (account is already deployed)
            expect(actualClauses[0].to).toBe("0x4444444444444444444444444444444444444444") // smart account address
            expect(actualClauses[0].data).toContain("0x14a38c94") // executeBatchWithCustomAuthorization selector
        })

        it("should build transaction for a deployed V1 smart account", async () => {
            // Set up test scenario: deployed V1 smart account
            setMockPrivyEmbeddedAddress("0x5555555555555555555555555555555555555555")
            setupSmartAccountContractResponses({
                smartAccountAddress: "0x5555555555555555555555555555555555555555",
                isDeployed: true,
                hasV1Account: true,
                version: 1,
            })

            const { result } = renderHook(() => useSmartWallet(), {
                wrapper: TestWrapper,
            })

            // Initialize the wallet first
            await act(async () => {
                await result.current.initialiseWallet()
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

            await act(async () => {
                await result.current.buildTransaction(txClauses)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(2) // V1 uses individual executions for each clause

            // V1 uses individual executeWithAuthorization for each clause (account is deployed)
            expect(actualClauses[0].to).toBe("0x5555555555555555555555555555555555555555") // smart account address
            expect(actualClauses[0].data).toContain("0x27557354") // execute selector (actual V1 behavior)

            // Second clause should also go to smart account for individual execution
            expect(actualClauses[1].to).toBe("0x5555555555555555555555555555555555555555") // smart account address
            expect(actualClauses[1].data).toContain("0x27557354") // execute selector for second clause
        })
    })
})
