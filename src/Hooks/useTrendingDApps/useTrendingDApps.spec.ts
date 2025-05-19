import { useRoundXApps, useXAppsShares, useCurrentAllocationsRoundId, XApp } from "~Hooks/VeBetterDao"
import { useTrendingDApps } from "./useTrendingDApps"
import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { DiscoveryDApp } from "~Constants"
import moment from "moment"

jest.mock("~Hooks/VeBetterDao")

// Setup test dates
const twoMonthsAgo = moment().subtract(2, "months").valueOf()
const fourMonthsAgo = moment().subtract(4, "months").valueOf()

// Mock DApps data
const mockDapps: DiscoveryDApp[] = [
    {
        name: "New DApp 1",
        href: "https://newdapp1.com",
        createAt: twoMonthsAgo,
        isCustom: false,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp1-id",
    },
    {
        name: "New DApp 2",
        href: "https://newdapp2.com",
        createAt: twoMonthsAgo,
        isCustom: false,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp2-id",
    },
    {
        name: "Old DApp 1",
        href: "https://olddapp1.com",
        createAt: fourMonthsAgo,
        isCustom: false,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp3-id",
    },
    {
        name: "Old DApp 2",
        href: "https://olddapp2.com",
        createAt: fourMonthsAgo,
        isCustom: false,
        amountOfNavigations: 0,
        veBetterDaoId: "dapp4-id",
    },
]

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

const initialStateMock = {
    discovery: {
        featured: mockDapps,
        favorites: [],
        custom: [],
        hasOpenedDiscovery: true,
        connectedApps: [],
        bannerInteractions: {},
    },
}

describe("useTrendingDApps", () => {
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
    })

    it("should return the trending dapps", () => {
        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        expect(result.current.trendingDapps.length).toEqual(3)
        expect(result.current.trendingDapps[0].name).toEqual("Old DApp 1")
        expect(result.current.trendingDapps[1].name).toEqual("New DApp 2")
        expect(result.current.trendingDapps[2].name).toEqual("New DApp 1")
    })

    it("should return empty array when no data is available", () => {
        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
        })

        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        expect(result.current.trendingDapps).toEqual([])
    })

    it("should return empty array when dapps are not available", () => {
        const emptyStateMock = {
            discovery: {
                ...initialStateMock.discovery,
                featured: [],
            },
        }

        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: emptyStateMock,
            },
        })

        expect(result.current.trendingDapps).toEqual([])
    })

    it("should correctly set isLoading when xApps are loading", () => {
        ;(useRoundXApps as jest.Mock).mockReturnValue({
            data: xApps,
            isLoading: true,
        })

        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should correctly set isLoading when xAppsShares are loading", () => {
        ;(useXAppsShares as jest.Mock).mockReturnValue({
            data: xAppsShares,
            isLoading: true,
        })

        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
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

        const { result } = renderHook(() => useTrendingDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        expect(result.current.trendingDapps.length).toEqual(3)
        expect(result.current.trendingDapps[0].name).toEqual("New DApp 1") // 5+1=6
        expect(result.current.trendingDapps[1].name).toEqual("New DApp 2") // 2+3=5
        expect(result.current.trendingDapps[2].name).toEqual("Old DApp 1") // 1+1=2
    })
})
