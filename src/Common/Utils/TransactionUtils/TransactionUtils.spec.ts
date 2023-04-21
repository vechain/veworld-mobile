import { Activity } from "~Model"
import TransactionUtils from "."

describe("TransactionUtils", () => {
    describe("checkForTransactionFinality", () => {
        it("should return false if the activity is not a transaction", async () => {
            const activity = {
                id: "0x123",
                isTransaction: false,
            } as Activity
            const thor = {} as Connex.Thor
            const result = await TransactionUtils.checkForTransactionFinality(
                activity,
                thor,
            )
            expect(result).toBe(false)
        })
        it("should return false if the activity does not have a txReceipt", async () => {
            const activity = {
                id: "0x123",
                isTransaction: true,
            } as Activity
            const thor = {} as Connex.Thor
            const result = await TransactionUtils.checkForTransactionFinality(
                activity,
                thor,
            )
            expect(result).toBe(false)
        })

        it("should return false if the block is not finalised", async () => {
            const activity = {
                id: "0x123",
                isTransaction: true,
                txReceipt: {
                    meta: {
                        blockNumber: 1,
                    },
                },
            } as Activity
            const thor = {
                block: () => ({
                    get: () => Promise.resolve({ isFinalized: false }),
                }),
            } as Connex.Thor
            const result = await TransactionUtils.checkForTransactionFinality(
                activity,
                thor,
            )
            expect(result).toBe(false)
        })

        it("should return true if the block is finalised", async () => {
            const activity = {
                id: "0x123",
                isTransaction: true,
                txReceipt: {
                    meta: {
                        blockNumber: 1,
                    },
                },
            } as Activity
            const thor = {
                block: () => ({
                    get: () => Promise.resolve({ isFinalized: true }),
                }),
            } as Connex.Thor
            const result = await TransactionUtils.checkForTransactionFinality(
                activity,
                thor,
            )
            expect(result).toBe(true)
        })
    })
})
