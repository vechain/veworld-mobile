import { TransactionClause } from "@vechain/sdk-core"
import { estimateSmartAccountFees } from "./estimateSmartAccountFees"

describe("estimateSmartAccountFees", () => {
    const mockClauses: TransactionClause[] = [
        {
            to: "0x1234567890123456789012345678901234567890",
            value: "0x0",
            data: "0x",
        },
    ]

    const mockOwnerAddress = "0xabcdef1234567890abcdef1234567890abcdef12"

    const mockRate = {
        vtho: 1,
        vet: 0.5,
        b3tr: 2,
    }

    const mockServiceFee = 0.1

    const mockGasPrices = {
        regular: "10000000000000",
        medium: "15000000000000",
        high: "20000000000000",
    }

    const mockSelectedNetworkId = "test-network-id"

    beforeEach(() => {
        // Clear the module cache to reset the gasEstimationCache between tests
        jest.resetModules()
    })

    describe("caching behavior", () => {
        it("should call estimateGasFn on first call", async () => {
            const mockEstimateGasFn = jest.fn().mockResolvedValue(21000)

            await estimateSmartAccountFees({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            expect(mockEstimateGasFn).toHaveBeenCalledTimes(1)
            expect(mockEstimateGasFn).toHaveBeenCalledWith(mockClauses, expect.any(Object))
        })

        it("should use cached result on second call with same clauses", async () => {
            // Import the module fresh to test caching within the same test
            const { estimateSmartAccountFees: freshEstimate } = require("./estimateSmartAccountFees")

            const mockEstimateGasFn = jest.fn().mockResolvedValue(21000)

            // First call
            const result1 = await freshEstimate({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            // Second call with same clauses
            const result2 = await freshEstimate({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            // Should only call estimateGasFn once (cached on second call)
            expect(mockEstimateGasFn).toHaveBeenCalledTimes(1)

            // Results should be identical
            expect(result1).toEqual(result2)
        })

        it("should call estimateGasFn again with different clauses", async () => {
            const { estimateSmartAccountFees: freshEstimate } = require("./estimateSmartAccountFees")

            const mockEstimateGasFn = jest.fn().mockResolvedValue(21000)

            const differentClauses: TransactionClause[] = [
                {
                    to: "0x9876543210987654321098765432109876543210",
                    value: "0x100",
                    data: "0xabcd",
                },
            ]

            // First call
            await freshEstimate({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            // Second call with different clauses
            await freshEstimate({
                clauses: differentClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            // Should call estimateGasFn twice (different clauses = cache miss)
            expect(mockEstimateGasFn).toHaveBeenCalledTimes(2)
        })

        it("should call estimateGasFn again with different network IDs", async () => {
            const { estimateSmartAccountFees: freshEstimate } = require("./estimateSmartAccountFees")

            const mockEstimateGasFn = jest.fn().mockResolvedValue(21000)

            const differentNetworkId = "different-network-id"

            // First call
            await freshEstimate({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            // Second call with different network ID
            await freshEstimate({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: differentNetworkId,
            })

            // Should call estimateGasFn twice (different network ID = cache miss)
            expect(mockEstimateGasFn).toHaveBeenCalledTimes(2)
        })

        it("should return correct fee structure", async () => {
            const mockEstimateGasFn = jest.fn().mockResolvedValue(21000)

            const result = await estimateSmartAccountFees({
                clauses: mockClauses,
                estimateGasFn: mockEstimateGasFn,
                ownerAddress: mockOwnerAddress,
                rate: mockRate,
                serviceFee: mockServiceFee,
                gasPrices: mockGasPrices,
                selectedNetworkId: mockSelectedNetworkId,
            })

            expect(result).toHaveProperty("transactionCost")
            expect(result.transactionCost).toHaveProperty("regular")
            expect(result.transactionCost).toHaveProperty("medium")
            expect(result.transactionCost).toHaveProperty("high")
            expect(result.transactionCost).toHaveProperty("legacy")

            // Each tier should have fees for all tokens
            expect(result.transactionCost.regular).toHaveProperty("vet")
            expect(result.transactionCost.regular).toHaveProperty("b3tr")
            expect(result.transactionCost.regular).toHaveProperty("vtho")
        })
    })
})
