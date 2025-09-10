import { useRoundXApps, useXAppsShares, useCurrentAllocationsRoundId, XApp } from "~Hooks/VeBetterDao"
import { useTrendingDAppsV2 } from "./useTrendingDAppsV2"
import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import moment from "moment"
import { VbdDApp } from "~Model"
import { useVeBetterDaoActiveDapps } from "~Hooks/useFetchFeaturedDApps"
import { useQuery } from "@tanstack/react-query"

jest.mock("~Hooks/VeBetterDao")
jest.mock("~Hooks/useFetchFeaturedDApps")
jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn().mockImplementation(args => {
        return { data: args.queryFn() }
    }),
}))

// Setup test dates
const twoMonthsAgo = moment().subtract(2, "months").valueOf()
const fourMonthsAgo = moment().subtract(4, "months").valueOf()

const xApps: XApp[] = [
    {
        id: "dapp1-id",
        teamWalletAddress: "0x123",
        name: "New DApp 1",
        metadataURI: "https://newdapp1.com",
        createdAtTimestamp: twoMonthsAgo.toString(),
    },
    {
        id: "dapp2-id",
        teamWalletAddress: "0x1236889",
        name: "New DApp 2",
        metadataURI: "https://newdapp2.com",
        createdAtTimestamp: twoMonthsAgo.toString(),
    },
    {
        id: "dapp3-id",
        teamWalletAddress: "0x12387768",
        name: "Old DApp 1",
        metadataURI: "https://olddapp1.com",
        createdAtTimestamp: fourMonthsAgo.toString(),
    },
]

const vbdApps = xApps.map(
    app =>
        ({
            ...app,
            app_urls: [],
            banner: "https://vechain.org",
            description: "TEST",
            external_url: "https://vechain.org",
            logo: "ipfs://test1",
            screenshots: [],
            social_urls: [],
            appAvailableForAllocationVoting: true,
        } satisfies VbdDApp),
)

const xAppsShares: {
    app: string
    share: number
    unallocatedShare: number
}[] = [
    {
        app: "dapp1-id",
        share: 0.5,
        unallocatedShare: 0.7,
    },
    {
        app: "dapp2-id",
        share: 2.5,
        unallocatedShare: 0.2,
    },
    {
        app: "dapp3-id",
        share: 1,
        unallocatedShare: 2,
    },
]

describe("useTrendingDAppsV2", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCurrentAllocationsRoundId as jest.Mock).mockReturnValue({
            data: 2,
            isLoading: false,
        })
        ;(useRoundXApps as jest.Mock).mockReturnValue({
            data: xApps,
            isLoading: false,
        })
        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: xAppsShares,
            isLoading: false,
        })
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: vbdApps,
            isLoading: false,
        })
        ;(useQuery as jest.Mock).mockImplementation(args => {
            return { data: args.queryFn(), isLoading: false }
        })
    })

    it("should return the trending dapps", () => {
        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.trendingDapps.length).toEqual(3)
    })

    it("should return empty array when no data is available", () => {
        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.trendingDapps).toEqual([])
    })

    it("should return empty array when dapps are not available", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.trendingDapps).toEqual([])
    })

    it("should correctly set isLoading when xApps are loading", () => {
        ;(useRoundXApps as jest.Mock).mockReturnValue({
            data: xApps,
            isLoading: true,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should correctly set isLoading when vbdApps are loading", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should correctly set isLoading when xAppsShares are loading", () => {
        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: xAppsShares,
            isLoading: true,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should sort dapps by total percentage (share + unallocatedShare)", () => {
        const customShares = [
            {
                app: "dapp1-id",
                share: 5,
                unallocatedShare: 1,
            },
            {
                app: "dapp2-id",
                share: 2,
                unallocatedShare: 3,
            },
            {
                app: "dapp3-id",
                share: 1,
                unallocatedShare: 1,
            },
        ]

        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: customShares,
            isLoading: false,
        })

        const { result } = renderHook(() => useTrendingDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.trendingDapps.length).toEqual(3)
    })
})
