import { useInfiniteQuery } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react-hooks"
import { defaultMainNetwork } from "~Constants"
import { Activity, ActivityEvent, ActivityStatus, ActivityType } from "~Model"
import { TestWrapper } from "~Test"
import { FilterType, filterValues } from "../constants"
import { useAccountActivities } from "./useAccountActivities"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useIsFocused: jest.fn().mockReturnValue(true),
}))

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useInfiniteQuery: jest.fn(),
}))

jest.mock("~Hooks/useIndexerClient", () => ({
    useIndexerClient: jest.fn().mockReturnValue({}),
}))

const address = "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"
const txId = "0xabc"

const localDapp = {
    id: txId,
    txId,
    type: ActivityType.DAPP_TRANSACTION,
    name: "Some dApp",
    timestamp: 1000000,
    status: ActivityStatus.SUCCESS,
    isTransaction: true,
    genesisId: defaultMainNetwork.genesis.id,
    from: address,
    to: [],
    clauses: [],
} as unknown as Activity

const remoteEvent = (eventName: ActivityEvent) => ({
    id: "event-1",
    txId,
    eventName,
    blockNumber: 1,
    blockTimestamp: 1000,
    origin: address,
    gasPayer: address,
    to: "0x0000000000000000000000000000456e65726779",
    from: address,
    value: "1",
    contractAddress: "0x0000000000000000000000000000456e65726779",
    reverted: false,
})

const mockRemote = (events: ReturnType<typeof remoteEvent>[]) =>
    jest.mocked(useInfiniteQuery).mockReturnValue({
        data: { pages: [{ data: events, pagination: { hasNext: false } }], pageParams: [0] },
        error: null,
        isFetching: false,
        isFetchingNextPage: false,
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
    } as unknown as ReturnType<typeof useInfiniteQuery>)

const render = (filterType: FilterType, filters: readonly ActivityEvent[]) =>
    renderHook(() => useAccountActivities(filterType, filters), {
        wrapper: TestWrapper,
        initialProps: { preloadedState: { activities: { activities: [localDapp] } } },
    })

describe("useAccountActivities", () => {
    it("keeps the local dapp row over an unclassified remote row on the All tab", () => {
        mockRemote([remoteEvent(ActivityEvent.UNKNOWN_TX)])
        const { result } = render(FilterType.ALL, filterValues.all.value)

        expect(result.current.activities).toHaveLength(1)
        expect(result.current.activities[0].type).toBe(ActivityType.DAPP_TRANSACTION)
    })

    it("keeps the classified remote row over the local dapp row on the All tab", () => {
        mockRemote([remoteEvent(ActivityEvent.TRANSFER_FT)])
        const { result } = render(FilterType.ALL, filterValues.all.value)

        expect(result.current.activities).toHaveLength(1)
        expect(result.current.activities[0].type).toBe(ActivityEvent.TRANSFER_FT)
    })

    it("does not merge local activities on a filtered tab", () => {
        mockRemote([remoteEvent(ActivityEvent.UNKNOWN_TX)])
        const { result } = render(FilterType.OTHER, filterValues.other.value)

        expect(result.current.activities).toHaveLength(1)
        expect(result.current.activities[0].type).toBe(ActivityEvent.UNKNOWN_TX)
    })
})
