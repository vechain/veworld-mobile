import { act, renderHook } from "@testing-library/react-hooks"
import { ReactNode } from "react"
import { B3TR } from "~Constants"
import { ActivityEvent, FungibleToken } from "~Model"
import { RootState } from "~Storage/Redux/Types"

import { TestHelpers, TestWrapper } from "~Test"

import { useAccountTokenActivities } from "./useAccountTokenActivities"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

describe("useAccountTokenActivities", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should do the correct call based on the token symbol", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({
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
            expect(indexerGet).toHaveBeenNthCalledWith(1, "/api/v2/history/{account}", {
                params: {
                    path: {
                        account: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    query: {
                        eventName: [
                            ActivityEvent.TRANSFER_VET,
                            ActivityEvent.SWAP_FT_TO_VET,
                            ActivityEvent.SWAP_VET_TO_FT,
                        ],
                        page: 0,
                        size: 6,
                        direction: "DESC",
                    },
                },
            })
        })

        rerender({ preloadedState: {}, token: TestHelpers.data.B3TRWithBalance })

        await waitFor(() => {
            expect(indexerGet).toHaveBeenNthCalledWith(2, "/api/v2/history/{account}", {
                params: {
                    path: {
                        account: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    query: {
                        eventName: [
                            ActivityEvent.TRANSFER_FT,
                            ActivityEvent.TRANSFER_SF,
                            ActivityEvent.SWAP_FT_TO_FT,
                            ActivityEvent.SWAP_FT_TO_VET,
                            ActivityEvent.SWAP_VET_TO_FT,
                        ],
                        page: 0,
                        size: 6,
                        direction: "DESC",
                        contractAddress: B3TR.address,
                    },
                },
            })
        })
    })
    it("should change the amount of items after the first page", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({
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
            expect(indexerGet).toHaveBeenNthCalledWith(1, "/api/v2/history/{account}", {
                params: {
                    path: {
                        account: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    query: {
                        eventName: [
                            ActivityEvent.TRANSFER_VET,
                            ActivityEvent.SWAP_FT_TO_VET,
                            ActivityEvent.SWAP_VET_TO_FT,
                        ],
                        page: 0,
                        size: 6,
                        direction: "DESC",
                    },
                },
            })
            expect(result.current.data?.data).toBeDefined()
        })

        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(indexerGet).toHaveBeenNthCalledWith(2, "/api/v2/history/{account}", {
                params: {
                    path: {
                        account: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    query: {
                        eventName: [
                            ActivityEvent.TRANSFER_VET,
                            ActivityEvent.SWAP_FT_TO_VET,
                            ActivityEvent.SWAP_VET_TO_FT,
                        ],
                        page: 1,
                        size: 4,
                        direction: "DESC",
                    },
                },
            })
        })
    })
})
