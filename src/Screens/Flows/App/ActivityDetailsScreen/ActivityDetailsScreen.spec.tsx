import { TestHelpers } from "~Test"

const { mockDappTxActivity, mockDappTxActivityNoBlock } = TestHelpers.data

describe("ActivityDetailsScreen Logic", () => {
    const shouldShowExplorerButton = (
        activity: { txId?: string; blockNumber?: number },
        activityFromStore: { blockNumber?: number } | null = null,
    ): boolean => {
        return !!(activity.txId && (activityFromStore ?? activity).blockNumber)
    }

    describe("Explorer Button Display Logic", () => {
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
    })
})
