import { getActivityModalTitle, getActivityTitle } from "./ActivityDetailsUtils"
import { ActivityStatus, ActivityType } from "~Model/Activity"
import { Activity } from "~Model"
import { renderHook } from "@testing-library/react-hooks"
import { useI18nContext } from "~i18n"
import { TestWrapper } from "~Test"
import { DIRECTIONS } from "~Constants"

const activityMock: Omit<Activity, "type"> = {
    id: "1",
    timestamp: 1717334400,
    from: "0x123",
    isTransaction: true,
    status: ActivityStatus.SUCCESS,
    blockNumber: 1,
}

describe("ActivityDetailsUtils", () => {
    describe("getActivityTitle", () => {
        it.each([
            [ActivityType.UNKNOWN_TX, "On-chain Transaction"],
            [ActivityType.SIGN_TYPED_DATA, "Sign typed data"],
            [ActivityType.SIGN_CERT, "Signed certificate"],
            [ActivityType.B3TR_ACTION, "VeBetter action on"],
            [ActivityType.SWAP_FT_TO_FT, "Swap"],
            [ActivityType.SWAP_FT_TO_VET, "Swap"],
            [ActivityType.SWAP_VET_TO_FT, "Swap"],
            [ActivityType.B3TR_SWAP_B3TR_TO_VOT3, "Token Conversion"],
            [ActivityType.B3TR_SWAP_VOT3_TO_B3TR, "Token Conversion"],
            [ActivityType.B3TR_CLAIM_REWARD, "Claimed voting rewards"],
            [ActivityType.B3TR_PROPOSAL_VOTE, "Vote on VeBetterDAO proposal"],
            [ActivityType.B3TR_UPGRADE_GM, "New galaxy member level"],
            [ActivityType.CONNECTED_APP_TRANSACTION, "Connected app"],
            [ActivityType.DAPP_TRANSACTION, "DApp Transaction"],
            [ActivityType.TRANSFER_FT, "Receive"],
            [ActivityType.TRANSFER_NFT, "NFT Receive"],
            [ActivityType.TRANSFER_VET, "Receive"],
            [ActivityType.TRANSFER_SF, "Receive"],
        ])("should return the correct title for an %s activity", (type, expected) => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, type: type }
            const title = getActivityTitle(activity, LL)
            expect(title).toBe(expected)
        })

        it.each([
            [ActivityType.TRANSFER_FT, "Send"],
            [ActivityType.TRANSFER_NFT, "NFT Send"],
            [ActivityType.TRANSFER_VET, "Send"],
            [ActivityType.TRANSFER_SF, "Send"],
        ])("should return the correct title for an %s send activity", (type, expected) => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, direction: DIRECTIONS.UP, type: type }
            const title = getActivityTitle(activity, LL)
            expect(title).toBe(expected)
        })

        it("should return the correct title for an DApp connection activity that is not a transaction", () => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, isTransaction: false, type: ActivityType.DAPP_TRANSACTION }
            const title = getActivityTitle(activity, LL)
            expect(title).toBe("DApp Connection")
        })

        it("should return the undefined for an unknown activity type", () => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, type: "SWAP_GLO_TO_VET" as ActivityType }
            const title = getActivityTitle(activity, LL)
            expect(title).toBeUndefined()
        })
    })

    describe("getActivityModalTitle", () => {
        it("should return the correct title for an B3TR action activity", () => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, type: ActivityType.B3TR_ACTION }
            const title = getActivityModalTitle(activity, LL)
            expect(title).toBe("VeBetter action")
        })

        it("should return the undefined for an unknown activity type", () => {
            const { result } = renderHook(() => useI18nContext(), { wrapper: TestWrapper })
            const { LL } = result.current

            const activity = { ...activityMock, type: "SWAP_GLO_TO_VET" as ActivityType }
            const title = getActivityModalTitle(activity, LL)
            expect(title).toBeUndefined()
        })
    })
})
