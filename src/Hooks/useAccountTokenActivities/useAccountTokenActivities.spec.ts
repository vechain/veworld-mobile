import { act, renderHook } from "@testing-library/react-hooks"
import { ReactNode } from "react"
import { ActivityEvent, FungibleToken } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { B3TR, defaultMainNetwork } from "~Constants"

import { TestHelpers, TestWrapper } from "~Test"

import { fetchIndexedHistoryEvent } from "~Networking"

import { useAccountTokenActivities } from "./useAccountTokenActivities"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchIndexedHistoryEvent: jest.fn(),
}))

describe("useAccountTokenActivities", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should do the correct call based on the token symbol", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: [],
            pagination: {
                hasNext: false,
            },
        })
        const { waitFor, rerender } = renderHook(
            ({ token }: { children?: ReactNode; preloadedState: Partial<RootState>; token: FungibleToken }) =>
                useAccountTokenActivities(token),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {},
                    token: TestHelpers.data.VETWithBalance,
                },
            },
        )

        await waitFor(() => {
            expect(fetchIndexedHistoryEvent).toHaveBeenNthCalledWith(
                1,
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [ActivityEvent.TRANSFER_VET, ActivityEvent.SWAP_FT_TO_VET, ActivityEvent.SWAP_VET_TO_FT],
                { pageSize: 6 },
            )
        })

        rerender({ preloadedState: {}, token: TestHelpers.data.B3TRWithBalance })

        await waitFor(() => {
            expect(fetchIndexedHistoryEvent).toHaveBeenNthCalledWith(
                2,
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [
                    ActivityEvent.TRANSFER_FT,
                    ActivityEvent.TRANSFER_SF,
                    ActivityEvent.SWAP_FT_TO_FT,
                    ActivityEvent.SWAP_FT_TO_VET,
                    ActivityEvent.SWAP_VET_TO_FT,
                ],
                { pageSize: 6, contractAddress: B3TR.address },
            )
        })
    })
    it("should change the amount of items after the first page", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: [],
            pagination: {
                hasNext: true,
            },
        })
        const { waitFor, result } = renderHook(
            ({ token }: { children?: ReactNode; preloadedState: Partial<RootState>; token: FungibleToken }) =>
                useAccountTokenActivities(token),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {},
                    token: TestHelpers.data.VETWithBalance,
                },
            },
        )

        await waitFor(() => {
            expect(fetchIndexedHistoryEvent).toHaveBeenNthCalledWith(
                1,
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [ActivityEvent.TRANSFER_VET, ActivityEvent.SWAP_FT_TO_VET, ActivityEvent.SWAP_VET_TO_FT],
                { pageSize: 6 },
            )
            expect(result.current.data?.data).toBeDefined()
        })

        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(fetchIndexedHistoryEvent).toHaveBeenNthCalledWith(
                2,
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                1,
                defaultMainNetwork,
                [ActivityEvent.TRANSFER_VET, ActivityEvent.SWAP_FT_TO_VET, ActivityEvent.SWAP_VET_TO_FT],
                { pageSize: 4 },
            )
        })
    })
})
