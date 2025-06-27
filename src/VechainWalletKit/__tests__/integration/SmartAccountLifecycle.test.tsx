import React from "react"
import { renderHook, waitFor, act } from "@testing-library/react-native"
import { VechainWalletProvider, useVechainWallet } from "../../providers/VechainWalletProvider"
import { VechainWalletSDKConfig } from "../../types/config"
import { createMockAdapter } from "../helpers/mockAdapters"
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

describe("Smart Account Lifecycle Integration (Direct Hook Testing)", () => {
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

    describe("First-time User Scenarios", () => {
        it("should handle user with no smart account", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            // Mock smart account as not deployed
            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: undefined,
                isDeployed: false,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.address).toBe(mockAddress)
                expect(result.current.isDeployed).toBe(false)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Verify smart account was checked
            expect(mockSmartAccount.getSmartAccount).toHaveBeenCalledWith(mockAddress)
        })

        it("should handle first transaction triggering smart account deployment", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            // Mock transaction builder to return deployment clauses
            const deploymentClauses = [
                {
                    to: "0xFactoryAddress",
                    value: "0x0",
                    data: "0xdeployment_data",
                },
            ]

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue(deploymentClauses)

            // Attempt to build a transaction (should trigger deployment)
            const userClauses = [
                {
                    to: "0x1111111111111111111111111111111111111111",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(userClauses)
            })

            // Verify smart account deployment was included
            expect(jest.mocked(buildSmartWalletTransactionClauses)).toHaveBeenCalledWith({
                txClauses: userClauses,
                smartAccountConfig: expect.any(Object),
                networkType: "testnet",
                signTypedDataFn: expect.any(Function),
            })
        })
    })

    describe("Existing User Scenarios", () => {
        it("should handle user with deployed smart account", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const smartAccountAddress = "0x5555555555555555555555555555555555555555"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: true },
            })

            // Mock smart account as deployed
            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: smartAccountAddress,
                isDeployed: true,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
                expect(result.current.address).toBe(mockAddress)
                expect(result.current.isDeployed).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Verify smart account was checked
            expect(mockSmartAccount.getSmartAccount).toHaveBeenCalledWith(mockAddress)
        })

        it("should handle transactions with deployed smart account", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: true },
            })

            // Mock smart account as deployed
            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: "0x5555555555555555555555555555555555555555",
                isDeployed: true,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Build a transaction with deployed smart account
            const userClauses = [
                {
                    to: "0x2222222222222222222222222222222222222222",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(userClauses)
            })

            // Verify transaction was built for deployed smart account
            expect(jest.mocked(buildSmartWalletTransactionClauses)).toHaveBeenCalledWith({
                txClauses: userClauses,
                smartAccountConfig: expect.any(Object),
                networkType: "testnet",
                signTypedDataFn: expect.any(Function),
            })
        })
    })

    describe("Smart Account Migration", () => {
        it("should handle V1 to V2 smart account migration", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            // Mock V1 smart account exists
            mockSmartAccount.hasV1SmartAccount.mockResolvedValue(true)
            mockSmartAccount.getSmartAccountVersion.mockResolvedValue("v1")

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Verify V1 smart account was checked
            expect(mockSmartAccount.hasV1SmartAccount).toHaveBeenCalledWith(mockAddress)
        })

        it("should handle smart account version detection", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: true },
            })

            // Mock V2 smart account
            mockSmartAccount.getSmartAccountVersion.mockResolvedValue("v2")
            mockSmartAccount.getSmartAccount.mockResolvedValue({
                address: "0x5555555555555555555555555555555555555555",
                isDeployed: true,
            })

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Verify version was detected
            expect(mockSmartAccount.getSmartAccountVersion).toHaveBeenCalledWith(mockAddress)
        })
    })

    describe("Network Configuration", () => {
        it("should handle mainnet configuration", async () => {
            const mainnetConfig: VechainWalletSDKConfig = {
                networkConfig: {
                    nodeUrl: "https://mainnet.vechain.org",
                    networkType: "mainnet",
                },
                providerConfig: {
                    appId: "test-app-id",
                },
            }

            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            const wrapper = createWrapper(adapter, mainnetConfig)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Build transaction to verify mainnet config
            const userClauses = [
                {
                    to: "0x3333333333333333333333333333333333333333",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(userClauses)
            })

            // Verify mainnet was used
            expect(jest.mocked(buildSmartWalletTransactionClauses)).toHaveBeenCalledWith({
                txClauses: userClauses,
                smartAccountConfig: expect.any(Object),
                networkType: "mainnet",
                signTypedDataFn: expect.any(Function),
            })
        })

        it("should handle testnet configuration", async () => {
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

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Build transaction to verify testnet config
            const userClauses = [
                {
                    to: "0x4444444444444444444444444444444444444444",
                    value: "0x0",
                    data: "0x",
                },
            ]

            await act(async () => {
                await result.current.buildTransaction(userClauses)
            })

            // Verify testnet was used
            expect(jest.mocked(buildSmartWalletTransactionClauses)).toHaveBeenCalledWith({
                txClauses: userClauses,
                smartAccountConfig: expect.any(Object),
                networkType: "testnet",
                signTypedDataFn: expect.any(Function),
            })
        })
    })

    describe("Error Handling", () => {
        it("should handle smart account deployment failures gracefully", async () => {
            const mockAddress = "0x1234567890123456789012345678901234567890"
            const adapter = createMockAdapter({
                isAuthenticated: true,
                account: { address: mockAddress, isDeployed: false },
            })

            // Mock smart account deployment failure
            mockSmartAccount.getSmartAccount.mockRejectedValue(new Error("Deployment failed"))

            const wrapper = createWrapper(adapter)
            const { result } = renderHook(() => useVechainWallet(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Should not crash despite deployment failure
            expect(result.current.address).toBe(mockAddress)
        })

        it("should handle factory address retrieval", async () => {
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

            // Reset transaction builder mock
            jest.mocked(buildSmartWalletTransactionClauses).mockResolvedValue([])

            // Verify factory address is accessible
            expect(mockSmartAccount.getFactoryAddress).toHaveBeenCalled()
        })
    })
})
