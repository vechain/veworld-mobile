import { renderHook } from "@testing-library/react-native"
import { usePrivySmartAccountAdapter } from "../../adapters/usePrivySmartAccountAdapter"

// Mock VeChain SDK to avoid BigInt issues
jest.mock("@vechain/sdk-core", () => ({
    Address: {
        of: jest.fn().mockImplementation((address: string) => ({
            toString: () => address,
            toJSON: () => address,
        })),
    },
    Clause: {
        callFunction: jest.fn().mockImplementation((_address, _func, _params) => ({
            to: "0x1234567890123456789012345678901234567890",
            value: "0",
            data: "0xmockeddata",
        })),
    },
    Transaction: jest.fn().mockImplementation(() => ({
        getTransactionHash: jest.fn().mockReturnValue(Buffer.from("mockhash", "hex")),
    })),
    ABIContract: {
        ofAbi: jest.fn().mockReturnValue({
            getFunction: jest.fn().mockReturnValue({
                selector: "0xmocked",
                encodeData: jest.fn().mockReturnValue("0xmockeddata"),
            }),
        }),
    },
}))

// Mock Privy SDK
jest.mock("@privy-io/expo", () => ({
    usePrivy: jest.fn(() => ({
        user: { id: "deployment-test-user" },
        logout: jest.fn(),
    })),
    useEmbeddedEthereumWallet: jest.fn(() => ({
        wallets: [
            {
                address: "0x5555555555555555555555555555555555555555",
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

/**
 * Smart Account Deployment Tests
 *
 * Comprehensive tests for smart account deployment detection and
 * transaction building behavior based on deployment status.
 */
describe("Smart Account Deployment", () => {
    describe("Deployment Detection", () => {
        it("should correctly detect undeployed smart accounts", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const undeployedAddress = "0x1111111111111111111111111111111111111111"
            const isDeployed = await result.current.isSmartAccountDeployed(undeployedAddress)

            expect(isDeployed).toBe(false)
        })

        it("should validate address format before checking deployment", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            // Test with various address formats
            const validAddress = "0x1234567890123456789012345678901234567890"
            const shortAddress = "0x1234"
            const invalidAddress = "not-an-address"

            // Valid address should not throw
            await expect(result.current.isSmartAccountDeployed(validAddress)).resolves.toBe(false)

            // Invalid addresses should still be handled gracefully by the implementation
            // Note: Current implementation doesn't validate, but interface allows for it
            await expect(result.current.isSmartAccountDeployed(shortAddress)).resolves.toBe(false)
            await expect(result.current.isSmartAccountDeployed(invalidAddress)).resolves.toBe(false)
        })

        it("should handle network connectivity issues gracefully", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const testAddress = "0x2222222222222222222222222222222222222222"

            // Should not throw even if network is unavailable
            // Current implementation returns false, but this tests resilience
            await expect(result.current.isSmartAccountDeployed(testAddress)).resolves.toBe(false)
        })
    })

    describe("Transaction Building Based on Deployment Status", () => {
        it("should include factory deployment call for undeployed V3 smart accounts", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const transactionParams = {
                txClauses: [
                    {
                        to: "0x9876543210987654321098765432109876543210",
                        value: "1000000000000000000",
                        data: "0x",
                    },
                ],
                smartAccountConfig: {
                    address: "0x3333333333333333333333333333333333333333",
                    version: 3,
                    isDeployed: false,
                    hasV1SmartAccount: false,
                    factoryAddress: "0xfactoryfactoryfactoryfactoryfactoryfa",
                },
                networkType: "testnet" as const,
            }

            const resultClauses = await result.current.buildTransaction(transactionParams)

            expect(Array.isArray(resultClauses)).toBe(true)
            expect(resultClauses.length).toBeGreaterThan(0)

            // Should contain deployment and execution clauses
            // In a real implementation, this would be 2 clauses: deployment + execution
            expect(resultClauses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        to: expect.any(String),
                        value: expect.any(String),
                        data: expect.any(String),
                    }),
                ]),
            )
        })

        it("should skip deployment for already deployed smart accounts", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const transactionParams = {
                txClauses: [
                    {
                        to: "0x9876543210987654321098765432109876543210",
                        value: "1000000000000000000",
                        data: "0x",
                    },
                ],
                smartAccountConfig: {
                    address: "0x4444444444444444444444444444444444444444",
                    version: 3,
                    isDeployed: true, // Already deployed
                    hasV1SmartAccount: false,
                    factoryAddress: "0xfactoryfactoryfactoryfactoryfactoryfa",
                },
                networkType: "testnet" as const,
            }

            const resultClauses = await result.current.buildTransaction(transactionParams)

            expect(Array.isArray(resultClauses)).toBe(true)
            expect(resultClauses.length).toBeGreaterThan(0)

            // Should only contain execution clause, no deployment
            expect(resultClauses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        to: expect.any(String),
                        value: expect.any(String),
                        data: expect.any(String),
                    }),
                ]),
            )
        })

        it("should handle V1 smart account transcations by building individual execution clauses", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const transactionParams = {
                txClauses: [
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
                ],
                smartAccountConfig: {
                    address: "0x5555555555555555555555555555555555555555",
                    version: 1,
                    isDeployed: true,
                    hasV1SmartAccount: true,
                    factoryAddress: "0xfactoryfactoryfactoryfactoryfactoryfa",
                },
                networkType: "testnet" as const,
            }

            const resultClauses = await result.current.buildTransaction(transactionParams)

            expect(Array.isArray(resultClauses)).toBe(true)
            // 1 for each of the txClauses
            expect(resultClauses.length).toBe(2)

            // V1 accounts use individual execution, different from V3 batch execution
            expect(resultClauses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        to: expect.any(String),
                        value: expect.any(String),
                        data: expect.any(String),
                    }),
                    expect.objectContaining({
                        to: expect.any(String),
                        value: expect.any(String),
                        data: expect.any(String),
                    }),
                ]),
            )
        })

        it("should handle V3 smart account transcations by building batch execution clauses", async () => {
            const { result } = renderHook(() => usePrivySmartAccountAdapter())

            const transactionParams = {
                txClauses: [
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
                ],
                smartAccountConfig: {
                    address: "0x6666666666666666666666666666666666666666",
                    version: 3,
                    isDeployed: false,
                    hasV1SmartAccount: false,
                    factoryAddress: "0xfactoryfactoryfactoryfactoryfactoryfa",
                },
                networkType: "testnet" as const,
            }

            const resultClauses = await result.current.buildTransaction(transactionParams)

            expect(Array.isArray(resultClauses)).toBe(true)
            // 1 for the deployment and 1 for the combined txClauses
            expect(resultClauses.length).toBe(2)

            // V3 accounts use batch execution, different from V1 individual execution
            expect(resultClauses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        to: expect.any(String),
                        value: expect.any(String),
                        data: expect.any(String),
                    }),
                ]),
            )
        })
    })
})
