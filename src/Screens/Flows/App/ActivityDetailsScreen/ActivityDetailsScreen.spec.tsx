import { TestHelpers } from "~Test"
import { ActivityStatus, ActivityType } from "~Model"

const { mockDappTxActivity, mockDappTxActivityNoBlock } = TestHelpers.data

describe("ActivityDetailsScreen Logic", () => {
    describe("Activity Status Logic", () => {
        const getActivityStatus = (
            activity: { status?: ActivityStatus },
            activityFromStore: { status?: ActivityStatus } | null = null,
            isPendingOrFailed: boolean = false,
        ): ActivityStatus => {
            return (
                (activityFromStore ?? activity).status ??
                (isPendingOrFailed ? ActivityStatus.REVERTED : ActivityStatus.SUCCESS)
            )
        }

        it("should prioritize activityFromStore status", () => {
            const activity = { status: ActivityStatus.PENDING }
            const activityFromStore = { status: ActivityStatus.SUCCESS }

            const status = getActivityStatus(activity, activityFromStore)
            expect(status).toBe(ActivityStatus.SUCCESS)
        })

        it("should use activity status when store activity is null", () => {
            const activity = { status: ActivityStatus.REVERTED }

            const status = getActivityStatus(activity, null)
            expect(status).toBe(ActivityStatus.REVERTED)
        })

        it("should default to SUCCESS when no status and not pending/failed", () => {
            const activity = {}

            const status = getActivityStatus(activity, null, false)
            expect(status).toBe(ActivityStatus.SUCCESS)
        })

        it("should default to REVERTED when no status but is pending/failed", () => {
            const activity = {}

            const status = getActivityStatus(activity, null, true)
            expect(status).toBe(ActivityStatus.REVERTED)
        })
    })

    describe("Explorer Button Display Logic", () => {
        const shouldShowExplorerButton = (
            activity: { txId?: string; blockNumber?: number },
            activityFromStore: { blockNumber?: number } | null = null,
        ): boolean => {
            return !!(activity.txId && (activityFromStore ?? activity).blockNumber)
        }
        it("should show explorer button when activity has both txId and blockNumber", () => {
            const shouldShow = shouldShowExplorerButton(mockDappTxActivity)
            expect(shouldShow).toBe(true)
        })

        it("should hide explorer button when activity has no blockNumber", () => {
            const shouldShow = shouldShowExplorerButton(mockDappTxActivityNoBlock)
            expect(shouldShow).toBe(false)
        })

        it("should hide explorer button when activity has no txId", () => {
            const activityNoTxId = { ...mockDappTxActivity, txId: undefined }
            const shouldShow = shouldShowExplorerButton(activityNoTxId)
            expect(shouldShow).toBe(false)
        })

        it("should show explorer button when activityFromStore has blockNumber", () => {
            const activityWithoutBlock = { ...mockDappTxActivity, blockNumber: undefined }
            const storeActivityWithBlock = { blockNumber: 123456 }

            const shouldShow = shouldShowExplorerButton(activityWithoutBlock, storeActivityWithBlock)
            expect(shouldShow).toBe(true)
        })

        it("should hide explorer button when neither activity nor store has blockNumber", () => {
            const activityWithoutBlock = { ...mockDappTxActivity, blockNumber: undefined }
            const storeActivityWithoutBlock = { blockNumber: undefined }

            const shouldShow = shouldShowExplorerButton(activityWithoutBlock, storeActivityWithoutBlock)
            expect(shouldShow).toBe(false)
        })

        it("should hide explorer button when txId is missing even if blockNumber exists", () => {
            const activityWithoutTxId = { ...mockDappTxActivity, txId: "" }
            const shouldShow = shouldShowExplorerButton(activityWithoutTxId)
            expect(shouldShow).toBe(false)
        })

        it("should hide explorer button when txId is null", () => {
            const activityWithNullTxId = { ...mockDappTxActivity, txId: null }
            const shouldShow = shouldShowExplorerButton(activityWithNullTxId as any)
            expect(shouldShow).toBe(false)
        })

        it("should prioritize store activity blockNumber over activity blockNumber", () => {
            const activityWithoutBlock = { ...mockDappTxActivity, blockNumber: undefined }
            const storeActivityWithBlock = { blockNumber: 999999 }

            const shouldShow = shouldShowExplorerButton(activityWithoutBlock, storeActivityWithBlock)
            expect(shouldShow).toBe(true)
        })

        it("should use activity blockNumber when store activity is null", () => {
            const shouldShow = shouldShowExplorerButton(mockDappTxActivity, null)
            expect(shouldShow).toBe(true)
        })
    })

    describe("Swap Activity Logic", () => {
        const getSwapResult = (activity: any, isSwap: boolean) => {
            if (!isSwap) return undefined

            let paidTokenAddress, paidAmount, receivedTokenAddress, receivedAmount

            switch (activity.type) {
                case ActivityType.B3TR_SWAP_B3TR_TO_VOT3: {
                    paidTokenAddress = "B3TR_ADDRESS"
                    paidAmount = activity.value
                    receivedTokenAddress = "VOT3_ADDRESS"
                    receivedAmount = activity.value
                    break
                }
                case ActivityType.B3TR_SWAP_VOT3_TO_B3TR: {
                    paidTokenAddress = "VOT3_ADDRESS"
                    paidAmount = activity.value
                    receivedTokenAddress = "B3TR_ADDRESS"
                    receivedAmount = activity.value
                    break
                }
                default: {
                    const { inputToken, inputValue, outputToken, outputValue } = activity
                    paidTokenAddress = inputToken
                    paidAmount = inputValue
                    receivedTokenAddress = outputToken
                    receivedAmount = outputValue
                }
            }

            return {
                paidTokenAddress,
                paidAmount,
                receivedTokenAddress,
                receivedAmount,
            }
        }

        it("should return undefined when isSwap is false", () => {
            const result = getSwapResult(mockDappTxActivity, false)
            expect(result).toBeUndefined()
        })

        it("should handle B3TR_SWAP_B3TR_TO_VOT3 activity type", () => {
            const swapActivity = {
                type: ActivityType.B3TR_SWAP_B3TR_TO_VOT3,
                value: "1000000000000000000",
            }

            const result = getSwapResult(swapActivity, true)
            expect(result).toEqual({
                paidTokenAddress: "B3TR_ADDRESS",
                paidAmount: "1000000000000000000",
                receivedTokenAddress: "VOT3_ADDRESS",
                receivedAmount: "1000000000000000000",
            })
        })

        it("should handle B3TR_SWAP_VOT3_TO_B3TR activity type", () => {
            const swapActivity = {
                type: ActivityType.B3TR_SWAP_VOT3_TO_B3TR,
                value: "2000000000000000000",
            }

            const result = getSwapResult(swapActivity, true)
            expect(result).toEqual({
                paidTokenAddress: "VOT3_ADDRESS",
                paidAmount: "2000000000000000000",
                receivedTokenAddress: "B3TR_ADDRESS",
                receivedAmount: "2000000000000000000",
            })
        })

        it("should handle generic swap activity", () => {
            const swapActivity = {
                type: ActivityType.SWAP_FT_TO_FT,
                inputToken: "0x123",
                inputValue: "1000000000000000000",
                outputToken: "0x456",
                outputValue: "2000000000000000000",
            }

            const result = getSwapResult(swapActivity, true)
            expect(result).toEqual({
                paidTokenAddress: "0x123",
                paidAmount: "1000000000000000000",
                receivedTokenAddress: "0x456",
                receivedAmount: "2000000000000000000",
            })
        })
    })

    describe("Activity Type Detection", () => {
        const isNFTTransfer = (activityType: ActivityType): boolean => {
            return activityType === ActivityType.TRANSFER_NFT || activityType === ActivityType.NFT_SALE
        }

        it("should detect NFT transfer activity", () => {
            expect(isNFTTransfer(ActivityType.TRANSFER_NFT)).toBe(true)
        })

        it("should detect NFT sale activity", () => {
            expect(isNFTTransfer(ActivityType.NFT_SALE)).toBe(true)
        })

        it("should not detect fungible token transfer as NFT", () => {
            expect(isNFTTransfer(ActivityType.TRANSFER_FT)).toBe(false)
        })

        it("should not detect dapp transaction as NFT", () => {
            expect(isNFTTransfer(ActivityType.DAPP_TRANSACTION)).toBe(false)
        })
    })

    describe("Transaction Status Logic", () => {
        const isPendingOrFailedActivity = (transaction: { reverted?: boolean } | null): boolean => {
            return !!transaction?.reverted
        }

        it("should return true when transaction is reverted", () => {
            const transaction = { reverted: true }
            expect(isPendingOrFailedActivity(transaction)).toBe(true)
        })

        it("should return false when transaction is not reverted", () => {
            const transaction = { reverted: false }
            expect(isPendingOrFailedActivity(transaction)).toBe(false)
        })

        it("should return false when transaction is null", () => {
            expect(isPendingOrFailedActivity(null)).toBe(false)
        })

        it("should return false when transaction has no reverted property", () => {
            const transaction = {}
            expect(isPendingOrFailedActivity(transaction)).toBe(false)
        })
    })
})
