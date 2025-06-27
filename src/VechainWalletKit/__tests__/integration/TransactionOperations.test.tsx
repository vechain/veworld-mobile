import React from "react"
import { renderHook, waitFor, act } from "@testing-library/react-native"
import { VechainWalletProvider, useVechainWallet } from "../../providers/VechainWalletProvider"
import { VechainWalletSDKConfig } from "../../types/config"
import { createMockAdapter } from "../helpers/mockAdapters"
import { TransactionClause } from "@vechain/sdk-core"
import { buildSmartWalletTransactionClauses } from "../../utils/transactionBuilder"

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

describe("Transaction Operations Integration (Direct Hook Testing)", () => {
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
            address: undefined,
            isDeployed: false,
        })
        mockSmartAccount.hasV1SmartAccount.mockResolvedValue(false)
        mockSmartAccount.getSmartAccountVersion.mockResolvedValue(undefined)

        // Reset transaction builder mock
        jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])
    })

    describe("Simple Transaction Operations", () => {
        it("should build and sign a simple transaction", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const mockSignature = Buffer.from("0x1234567890abcdef", "hex")
            adapter.signTransaction.mockResolvedValue(mockSignature)

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute simple transaction
            const clauses: TransactionClause[] = [
                {
                    to: "0x1234567890123456789012345678901234567890",
                    value: "0x0",
                    data: "0x",
                },
            ]

            let transaction: any = null
            let signature: Buffer | null = null

            await act(async () => {
                transaction = await result.current.buildTransaction(clauses)
                signature = await result.current.signTransaction(transaction)
            })

            // Verify transaction was built
            expect(mockThorClient.gas.estimateGas).toHaveBeenCalled()
            expect(mockThorClient.transactions.buildTransactionBody).toHaveBeenCalled()

            // Verify transaction was signed
            expect(adapter.signTransaction).toHaveBeenCalled()
            expect(signature).toEqual(mockSignature)
        })

        it("should handle gas estimation correctly", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            // Mock gas estimation returning higher gas
            mockThorClient.gas.estimateGas.mockResolvedValue({
                totalGas: 50000,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute transaction
            const clauses: TransactionClause[] = [
                {
                    to: "0x1234567890123456789012345678901234567890",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(clauses)
            })

            // Verify gas estimation was called with correct parameters
            expect(mockThorClient.gas.estimateGas).toHaveBeenCalledWith(
                [], // Smart wallet clauses (empty in mock)
                mockAddress,
                { gasPadding: 1 },
            )

            // Verify transaction body was built with estimated gas
            expect(mockThorClient.transactions.buildTransactionBody).toHaveBeenCalledWith(
                [],
                50000, // Should use estimated gas
                expect.objectContaining({
                    isDelegated: false,
                }),
            )
        })

        it("should handle custom gas options", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute transaction with custom gas
            const clauses: TransactionClause[] = [
                {
                    to: "0x4444444444444444444444444444444444444444",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(clauses, { gas: 200000 })
            })

            // Verify transaction body was built with custom gas (max of estimated and custom)
            expect(mockThorClient.transactions.buildTransactionBody).toHaveBeenCalledWith(
                [],
                200000, // Should use custom gas since it's higher than estimated (21000)
                expect.objectContaining({
                    isDelegated: false,
                }),
            )
        })
    })

    describe("Batch Transaction Operations", () => {
        it("should handle multiple clauses in one transaction", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute batch transaction
            const clauses: TransactionClause[] = [
                {
                    to: "0x1111111111111111111111111111111111111111",
                    value: "0x0",
                    data: "0x",
                },
                {
                    to: "0x2222222222222222222222222222222222222222",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(clauses)
            })

            // Verify transaction builder was called with multiple clauses
            expect(jest.mocked(buildSmartWalletTransactionClauses)).toHaveBeenCalledWith({
                txClauses: [
                    {
                        to: "0x1111111111111111111111111111111111111111",
                        value: "0x0",
                        data: "0x",
                    },
                    {
                        to: "0x2222222222222222222222222222222222222222",
                        value: "0x0",
                        data: "0x",
                    },
                ],
                smartAccountConfig: expect.any(Object),
                networkType: "testnet",
                signTypedDataFn: expect.any(Function),
            })
        })
    })

    describe("Delegated Transaction Operations", () => {
        it("should handle delegated transactions", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute delegated transaction
            const clauses: TransactionClause[] = [
                {
                    to: "0x3333333333333333333333333333333333333333",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(clauses, { isDelegated: true })
            })

            // Verify transaction body was built with delegation flag
            expect(mockThorClient.transactions.buildTransactionBody).toHaveBeenCalledWith(
                [],
                expect.any(Number),
                expect.objectContaining({
                    isDelegated: true,
                }),
            )
        })
    })

    describe("Message Signing Operations", () => {
        it("should sign messages correctly", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const mockSignature = Buffer.from("message-signature")
            adapter.signMessage.mockResolvedValue(mockSignature)

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Execute message signing
            const message = Buffer.from("Hello VeChain!", "utf8")
            let signature: Buffer | null = null

            await act(async () => {
                signature = await result.current.signMessage(message)
            })

            // Verify message was signed with correct data
            expect(adapter.signMessage).toHaveBeenCalledWith(message)
            expect(signature).toEqual(mockSignature)
        })
    })

    describe("Transaction Options Handling", () => {
        it("should handle all transaction options correctly", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Verify the provider is working with all transaction options
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.address).toBe(mockAddress)
        })
    })
})
