import React from "react"
import { renderHook, act } from "@testing-library/react-native"
import { keccak256 } from "@ethersproject/keccak256"
import { toUtf8Bytes } from "@ethersproject/strings"
import { useSmartWallet } from "../../providers/SmartWalletProvider"
import { SmartWalletWithPrivyProvider } from "../../providers/SmartWalletWithPrivy"
import { SimpleAccountFactoryABI, SimpleAccountABI } from "../../utils/abi"
import { GenericDelegationDetails } from "../../types/transaction"
import { B3TR } from "../../../Constants"
import { BigNumberUtils } from "../../../Utils"
import { ABIFunction, ERC20_ABI, Hex } from "@vechain/sdk-core"

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
            blocks: {
                getGenesisBlock: jest.fn().mockResolvedValue({
                    id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                }),
            },
        }),
    },
}))

// Get reference to the mocked function after the mock is defined
const { ThorClient } = require("@vechain/sdk-network")
const mockBuildTransactionBody = ThorClient.at().transactions.buildTransactionBody

// Helper function to calculate function selector from ABI
const getFunctionSelector = (abi: readonly any[], functionName: string): string => {
    const functionABI = abi.find((fn: any) => fn.name === functionName)
    if (!functionABI) {
        throw new Error(`Function ${functionName} not found in ABI`)
    }
    const signature = `${functionABI.name}(${functionABI.inputs.map((input: any) => input.type).join(",")})`
    return keccak256(toUtf8Bytes(signature)).slice(0, 10)
}

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

const mockDelegatorDepositAccount = "0x1234567890123456789012345678901234567890"

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

    describe("Transaction building based on deployment status", () => {
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

            const createAccountSelector = getFunctionSelector(SimpleAccountFactoryABI, "createAccount")
            expect(actualClauses[0].data).toContain(createAccountSelector)

            // Second clause should be batch execution (using correct address from explicit mock)
            expect(actualClauses[1].to).toBe("0x3333333333333333333333333333333333333333")

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[1].data).toContain(executeBatchSelector)
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

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[0].data).toContain(executeBatchSelector)
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

            const executeSelector = getFunctionSelector(SimpleAccountABI, "executeWithAuthorization")
            expect(actualClauses[0].data).toContain(executeSelector)

            // Second clause should also go to smart account for individual execution
            expect(actualClauses[1].to).toBe("0x5555555555555555555555555555555555555555") // smart account address
            expect(actualClauses[1].data).toContain(executeSelector)
        })
    })

    describe("Transaction building using generic delegation", () => {
        const erc20AbiJson = ERC20_ABI.filter(abi => abi.type === "function" && abi.name === "transfer")[0]
        const erc20TransferAbi = new ABIFunction(erc20AbiJson)

        it("should build transaction for undeployed V3 smart account using generic delegation to pay for the transaction", async () => {
            // Set up test scenario: undeployed V3 smart account
            const embeddedAddress = "0x3333333333333333333333333333333333333333"
            setMockPrivyEmbeddedAddress(embeddedAddress)
            const smartAccountAddress = "0x4444444444444444444444444444444444444444"
            setupSmartAccountContractResponses({
                smartAccountAddress,
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
            ]

            const genericDelegationFee = new BigNumberUtils("5000000000000000000")
            const genericDelegationDetails: GenericDelegationDetails = {
                token: B3TR.symbol,
                tokenAddress: B3TR.address,
                fee: genericDelegationFee,
                depositAccount: mockDelegatorDepositAccount,
            }
            await act(async () => {
                await result.current.buildTransaction(txClauses, undefined, genericDelegationDetails)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(2) // deployment + batch execution of 2 clauses

            // First clause: Smart account deployment
            expect(actualClauses[0].to).toBe("0x713b908bcf77f3e00efef328e50b657a1a23aeaf") // factory address (testnet)

            const createAccountSelector = getFunctionSelector(SimpleAccountFactoryABI, "createAccount")
            expect(actualClauses[0].data).toContain(createAccountSelector)

            // Second clause: Batch execution containing user transaction + B3TR fee transfer
            expect(actualClauses[1].to).toBe(smartAccountAddress)

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[1].data).toContain(executeBatchSelector)

            // Decode the batch execution to verify it contains both the user transaction and fee transfer
            const executeBatchWithAuthorizationAbi = new ABIFunction(
                SimpleAccountABI.find(fn => fn.name === "executeBatchWithAuthorization")!,
            )
            const decodedBatchData = executeBatchWithAuthorizationAbi.decodeData(Hex.of(actualClauses[1].data))

            // Verify the B3TR fee transfer is included in the batch
            const batchToAddresses = decodedBatchData.args![0] as string[]
            const batchDataArray = decodedBatchData.args![2] as string[]

            // Second transaction in batch should be B3TR transfer to deposit account
            expect(batchToAddresses[1]).toBe(B3TR.address)
            const b3trTransferData = erc20TransferAbi.decodeData(Hex.of(batchDataArray[1]))
            expect(b3trTransferData.functionName).toBe("transfer")
            expect(b3trTransferData.args?.[0]).toBe(mockDelegatorDepositAccount)
            expect(b3trTransferData.args?.[1]?.toString()).toBe(genericDelegationFee.toString)
        })

        it("should build transaction for already deployed V3 smart account using generic delegation to pay for the transaction", async () => {
            const smartAccountAddress = "0x4444444444444444444444444444444444444444"
            // Set up test scenario: already deployed V3 smart account
            setMockPrivyEmbeddedAddress("0x3333333333333333333333333333333333333333")
            setupSmartAccountContractResponses({
                smartAccountAddress,
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

            const genericDelegationFee = new BigNumberUtils("5000000000000000000")
            const genericDelegationDetails: GenericDelegationDetails = {
                token: B3TR.symbol,
                tokenAddress: B3TR.address,
                fee: genericDelegationFee,
                depositAccount: mockDelegatorDepositAccount,
            }

            // Build the transaction with generic delegation
            await act(async () => {
                await result.current.buildTransaction(txClauses, undefined, genericDelegationDetails)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(1) // only batch execution, no deployment needed

            // Single clause: Batch execution containing user transaction + B3TR fee transfer
            expect(actualClauses[0].to).toBe(smartAccountAddress)

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[0].data).toContain(executeBatchSelector)

            // Decode the batch execution to verify it contains both the user transaction and fee transfer
            const executeBatchWithAuthorizationAbi = new ABIFunction(
                SimpleAccountABI.find(fn => fn.name === "executeBatchWithAuthorization")!,
            )
            const decodedBatchData = executeBatchWithAuthorizationAbi.decodeData(Hex.of(actualClauses[0].data))

            // Verify the B3TR fee transfer is included in the batch
            const batchToAddresses = decodedBatchData.args![0] as string[]
            const batchDataArray = decodedBatchData.args![2] as string[]

            // Second transaction in batch should be B3TR transfer to deposit account
            expect(batchToAddresses[1]).toBe(B3TR.address)
            const b3trTransferData = erc20TransferAbi.decodeData(Hex.of(batchDataArray[1]))
            expect(b3trTransferData.functionName).toBe("transfer")
            expect(b3trTransferData.args?.[0]).toBe(mockDelegatorDepositAccount)
            expect(b3trTransferData.args?.[1]?.toString()).toBe(genericDelegationFee.toString)
        })

        it("should build transaction for a deployed V1 smart account using generic delegation to pay for the transaction", async () => {
            // Set up test scenario: deployed V1 smart account
            const smartAccountAddress = "0x5555555555555555555555555555555555555555"
            const embeddedAddress = "0x3333333333333333333333333333333333333333"
            setMockPrivyEmbeddedAddress(embeddedAddress)
            setupSmartAccountContractResponses({
                smartAccountAddress,
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

            const genericDelegationFee = new BigNumberUtils("5000000000000000000")
            const genericDelegationDetails: GenericDelegationDetails = {
                token: B3TR.symbol,
                tokenAddress: B3TR.address,
                fee: genericDelegationFee,
                depositAccount: mockDelegatorDepositAccount,
            }
            await act(async () => {
                await result.current.buildTransaction(txClauses, undefined, genericDelegationDetails)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(3) // V1 uses individual executions for each clause

            const executeSelector = getFunctionSelector(SimpleAccountABI, "executeWithAuthorization")

            // First clause: User transaction wrapped in executeWithAuthorization
            expect(actualClauses[0].to).toBe(smartAccountAddress)
            expect(actualClauses[0].data).toContain(executeSelector)

            // Second clause: User transaction wrapped in executeWithAuthorization
            expect(actualClauses[1].to).toBe(smartAccountAddress)
            expect(actualClauses[1].data).toContain(executeSelector)

            // Third clause: B3TR fee transfer wrapped in executeWithAuthorization
            const feeTransferClause = actualClauses[2]
            expect(feeTransferClause.to).toBe(smartAccountAddress)
            expect(feeTransferClause.data).toContain(executeSelector)

            // Decode the executeWithAuthorization to get the embedded ERC20 transfer
            const executeWithAuthorizationAbi = new ABIFunction(
                SimpleAccountABI.find(fn => fn.name === "executeWithAuthorization")!,
            )
            const decodedExecuteData = executeWithAuthorizationAbi.decodeData(Hex.of(feeTransferClause.data))

            // Extract and verify the embedded B3TR transfer
            const embeddedTransferData = decodedExecuteData.args![2] as string // The 'data' parameter
            const b3trTransferData = erc20TransferAbi.decodeData(Hex.of(embeddedTransferData))

            expect(b3trTransferData.functionName).toBe("transfer")
            expect(b3trTransferData.args?.[0]).toBe(mockDelegatorDepositAccount)
            expect(b3trTransferData.args?.[1]?.toString()).toBe(genericDelegationFee.toString)
        })

        it("should build transaction for undeployed V3 smart account using VET generic delegation", async () => {
            // Set up test scenario: undeployed V3 smart account
            const embeddedAddress = "0x6666666666666666666666666666666666666666"
            setMockPrivyEmbeddedAddress(embeddedAddress)
            const smartAccountAddress = "0x7777777777777777777777777777777777777777"
            setupSmartAccountContractResponses({
                smartAccountAddress,
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
            ]

            const genericDelegationFee = new BigNumberUtils("2000000000000000000")
            const genericDelegationDetails: GenericDelegationDetails = {
                token: "VET",
                tokenAddress: "", // Not needed for VET
                fee: genericDelegationFee,
                depositAccount: mockDelegatorDepositAccount,
            }
            await act(async () => {
                await result.current.buildTransaction(txClauses, undefined, genericDelegationDetails)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(2) // deployment + batch execution of 2 clauses

            // First clause: Smart account deployment
            expect(actualClauses[0].to).toBe("0x713b908bcf77f3e00efef328e50b657a1a23aeaf") // factory address (testnet)

            const createAccountSelector = getFunctionSelector(SimpleAccountFactoryABI, "createAccount")
            expect(actualClauses[0].data).toContain(createAccountSelector)

            // Second clause: Batch execution containing user transaction + VET fee transfer
            expect(actualClauses[1].to).toBe(smartAccountAddress)

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[1].data).toContain(executeBatchSelector)

            // Decode the batch execution to verify it contains both the user transaction and VET fee transfer
            const executeBatchWithAuthorizationAbi = new ABIFunction(
                SimpleAccountABI.find(fn => fn.name === "executeBatchWithAuthorization")!,
            )
            const decodedBatchData = executeBatchWithAuthorizationAbi.decodeData(Hex.of(actualClauses[1].data))

            // Verify the VET fee transfer is included in the batch
            const batchToAddresses = decodedBatchData.args![0] as string[]
            const batchValues = decodedBatchData.args![1] // Keep as decoded BigInt array
            const batchDataArray = decodedBatchData.args![2] as string[]

            // Second transaction in batch should be VET transfer to deposit account
            expect(batchToAddresses[1]).toBe(mockDelegatorDepositAccount)
            expect(batchValues[1]).toBe(BigInt(genericDelegationFee.toString))
            expect(batchDataArray[1]).toBe("0x") // Empty data for VET transfer
        })

        it("should build transaction for deployed V3 smart account using VET generic delegation", async () => {
            // Set up test scenario: deployed V3 smart account
            const smartAccountAddress = "0x8888888888888888888888888888888888888888"
            setMockPrivyEmbeddedAddress("0x6666666666666666666666666666666666666666")
            setupSmartAccountContractResponses({
                smartAccountAddress,
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
                    value: "1500000000000000000",
                    data: "0x",
                },
            ]

            const genericDelegationFee = new BigNumberUtils("3000000000000000000")
            const genericDelegationDetails: GenericDelegationDetails = {
                token: "VET",
                tokenAddress: "", // Not needed for VET
                fee: genericDelegationFee,
                depositAccount: mockDelegatorDepositAccount,
            }

            // Build the transaction with VET generic delegation
            await act(async () => {
                await result.current.buildTransaction(txClauses, undefined, genericDelegationDetails)
            })

            expect(mockBuildTransactionBody).toHaveBeenCalled()
            const actualClauses = mockBuildTransactionBody.mock.calls[0][0]
            expect(actualClauses).toHaveLength(1) // only batch execution, no deployment needed

            // Single clause: Batch execution containing user transaction + VET fee transfer
            expect(actualClauses[0].to).toBe(smartAccountAddress)

            const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
            expect(actualClauses[0].data).toContain(executeBatchSelector)

            // Decode the batch execution to verify it contains both the user transaction and VET fee transfer
            const executeBatchWithAuthorizationAbi = new ABIFunction(
                SimpleAccountABI.find(fn => fn.name === "executeBatchWithAuthorization")!,
            )
            const decodedBatchData = executeBatchWithAuthorizationAbi.decodeData(Hex.of(actualClauses[0].data))

            // Verify the VET fee transfer is included in the batch
            const batchToAddresses = decodedBatchData.args![0] as string[]
            const batchValues = decodedBatchData.args![1] // Keep as decoded BigInt array
            const batchDataArray = decodedBatchData.args![2] as string[]

            // Second transaction in batch should be VET transfer to deposit account
            expect(batchToAddresses[1]).toBe(mockDelegatorDepositAccount)
            expect(batchValues[1]).toBe(BigInt(genericDelegationFee.toString))
            expect(batchDataArray[1]).toBe("0x") // Empty data for VET transfer
        })
    })
})
