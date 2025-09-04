import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import moment from "moment"

import { useVeBetterDaoActiveDapps, useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdDApp } from "~Model"
import { useNewDAppsV2 } from "./useNewDAppsV2"
import { useQuery } from "@tanstack/react-query"

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

// Mock VeBetterDao DApps data
const mockVeBetterDaoDapps: VbdDApp[] = [
    {
        id: "dapp1-id",
        name: "New DApp 1",
        teamWalletAddress: "0x123",
        metadataURI: "ipfs://test1",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp2-id",
        name: "New DApp 2",
        teamWalletAddress: "0x456",
        metadataURI: "ipfs://test2",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp3-id",
        name: "Old DApp 1",
        teamWalletAddress: "0x789",
        metadataURI: "ipfs://test3",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp4-id",
        name: "Old DApp 2",
        teamWalletAddress: "0xabc",
        metadataURI: "ipfs://test4",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: false,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp5-id",
        name: "Old DApp 3",
        teamWalletAddress: "0xdef",
        metadataURI: "ipfs://test5",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp6-id",
        name: "New DApp 3",
        teamWalletAddress: "0x111",
        metadataURI: "ipfs://test6",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp7-id",
        name: "New DApp 4",
        teamWalletAddress: "0x222",
        metadataURI: "ipfs://test7",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp8-id",
        name: "Old DApp 4",
        teamWalletAddress: "0x333",
        metadataURI: "ipfs://test8",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp9-id",
        name: "New DApp 5",
        teamWalletAddress: "0x444",
        metadataURI: "ipfs://test9",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp10-id",
        name: "Old DApp 5",
        teamWalletAddress: "0x555",
        metadataURI: "ipfs://test10",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: false,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp11-id",
        name: "New DApp 6",
        teamWalletAddress: "0x666",
        metadataURI: "ipfs://test11",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp12-id",
        name: "Old DApp 6",
        teamWalletAddress: "0x777",
        metadataURI: "ipfs://test12",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp13-id",
        name: "New DApp 7",
        teamWalletAddress: "0x888",
        metadataURI: "ipfs://test13",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp14-id",
        name: "Old DApp 7",
        teamWalletAddress: "0x999",
        metadataURI: "ipfs://test14",
        createdAtTimestamp: moment(fourMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: false,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
    {
        id: "dapp15-id",
        name: "New DApp 8",
        teamWalletAddress: "0xaaa",
        metadataURI: "ipfs://test15",
        createdAtTimestamp: moment(twoMonthsAgo).unix().toString(),
        appAvailableForAllocationVoting: true,
        app_urls: [],
        banner: "BANNER",
        description: "DESC",
        external_url: "https://vechain.org",
        logo: "ipfs://test1",
        screenshots: [],
        social_urls: [],
    },
]

describe("useNewDAppsV2", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useVeBetterDaoDapps as jest.Mock).mockImplementation(() => ({
            data: [],
            isFetching: false,
        }))
        ;(useQuery as jest.Mock).mockImplementation(args => {
            return { data: args.queryFn(), isLoading: false }
        })
    })

    it("should return new DApps created in the last 3 months", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: mockVeBetterDaoDapps.slice(0, 4),
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        // Check the result
        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toHaveLength(2)
    })

    it("should return newest 10 DApps when no DApps are newer than 3 months", () => {
        const extraVeBetterDaoDapps = Array.from({ length: 15 }, (_, index) => ({
            id: `extra-dapp-${index}`,
            name: `Extra Old DApp ${index}`,
            teamWalletAddress: `0x${index}`,
            metadataURI: `ipfs://extra${index}`,
            createdAtTimestamp: moment(fourMonthsAgo - index * 1000)
                .unix()
                .toString(),
            appAvailableForAllocationVoting: true,
        }))

        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: extraVeBetterDaoDapps,
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        // Should return 10 DApps max when none are newer than 3 months
        expect(result.current.newDapps).toHaveLength(10)
    })

    it("should handle loading state correctly", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.newDapps).toEqual([])
    })

    it("should handle empty data gracefully", () => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDAppsV2(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toEqual([])
    })
})
