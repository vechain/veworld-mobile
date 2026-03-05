import { renderHook } from "@testing-library/react-hooks"
import { ActivityEvent } from "~Model"
import { TestWrapper } from "~Test"
import { useHasVotedInCurrentRound } from "./useHasVotedInCurrentRound"

const indexerGet = jest.fn()
const getCurrentAllocationsRoundId = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

jest.mock("~Hooks/useThorClient", () => ({
    ...jest.requireActual("~Hooks/useThorClient"),
    useMainnetThorClient: jest.fn().mockReturnValue({}),
}))

jest.mock("~Hooks/VeBetterDao/useCurrentAllocationRoundId", () => ({
    ...jest.requireActual("~Hooks/VeBetterDao/useCurrentAllocationRoundId"),
    getCurrentAllocationsRoundId: (...args: any[]) => getCurrentAllocationsRoundId(...args),
}))

describe("useHasVotedInCurrentRound", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return true if user voted in current round", async () => {
        ;(getCurrentAllocationsRoundId as jest.Mock).mockResolvedValue("17")
        ;(indexerGet as jest.Mock).mockResolvedValue({
            data: [{ roundId: "17" }],
            pagination: { hasNext: false },
        })

        const { result, waitFor } = renderHook(() => useHasVotedInCurrentRound(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toEqual({
                currentRoundId: "17",
                hasVotedInCurrentRound: true,
            })
        })

        expect(indexerGet).toHaveBeenCalledWith("/api/v2/history/{account}", {
            params: {
                path: {
                    account: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                },
                query: {
                    page: 0,
                    size: 1,
                    direction: "DESC",
                    eventName: [ActivityEvent.B3TR_XALLOCATION_VOTE],
                },
            },
        })
    })

    it("should return false if latest vote event round does not match current round", async () => {
        ;(getCurrentAllocationsRoundId as jest.Mock).mockResolvedValue("18")
        ;(indexerGet as jest.Mock).mockResolvedValue({
            data: [{ roundId: "17" }],
            pagination: { hasNext: true },
        })

        const { result, waitFor } = renderHook(() => useHasVotedInCurrentRound(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toEqual({
                currentRoundId: "18",
                hasVotedInCurrentRound: false,
            })
        })

        expect(indexerGet).toHaveBeenCalledTimes(1)
    })
})
