import { renderHook } from "@testing-library/react-hooks"
import { useNewDApps } from "./useNewDApps"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { TestWrapper } from "~Test"
import moment from "moment"
import { DiscoveryDApp } from "~Constants"
import { VeBetterDaoDapp } from "~Model"

// Mock the dependencies
jest.mock("~Hooks/useFetchFeaturedDApps")

// Setup test dates
const twoMonthsAgo = moment().subtract(2, "months").valueOf()
const fourMonthsAgo = moment().subtract(4, "months").valueOf()

// Mock VeBetterDao DApps data
const mockVeBetterDaoDapps: VeBetterDaoDapp[] = [
    {
        id: "dapp1-id",
        name: "New DApp 1",
        teamWalletAddress: "0x123",
        metadataURI: "ipfs://test1",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp2-id",
        name: "New DApp 2",
        teamWalletAddress: "0x456",
        metadataURI: "ipfs://test2",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp3-id",
        name: "Old DApp 1",
        teamWalletAddress: "0x789",
        metadataURI: "ipfs://test3",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp4-id",
        name: "Old DApp 2",
        teamWalletAddress: "0xabc",
        metadataURI: "ipfs://test4",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: false,
    },
    {
        id: "dapp5-id",
        name: "Old DApp 3",
        teamWalletAddress: "0xdef",
        metadataURI: "ipfs://test5",
        createdAtTimestamp: fourMonthsAgo.toString(),
    },
    {
        id: "dapp6-id",
        name: "New DApp 3",
        teamWalletAddress: "0x111",
        metadataURI: "ipfs://test6",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp7-id",
        name: "New DApp 4",
        teamWalletAddress: "0x222",
        metadataURI: "ipfs://test7",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp8-id",
        name: "Old DApp 4",
        teamWalletAddress: "0x333",
        metadataURI: "ipfs://test8",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp9-id",
        name: "New DApp 5",
        teamWalletAddress: "0x444",
        metadataURI: "ipfs://test9",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp10-id",
        name: "Old DApp 5",
        teamWalletAddress: "0x555",
        metadataURI: "ipfs://test10",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: false,
    },
    {
        id: "dapp11-id",
        name: "New DApp 6",
        teamWalletAddress: "0x666",
        metadataURI: "ipfs://test11",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp12-id",
        name: "Old DApp 6",
        teamWalletAddress: "0x777",
        metadataURI: "ipfs://test12",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp13-id",
        name: "New DApp 7",
        teamWalletAddress: "0x888",
        metadataURI: "ipfs://test13",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
    {
        id: "dapp14-id",
        name: "Old DApp 7",
        teamWalletAddress: "0x999",
        metadataURI: "ipfs://test14",
        createdAtTimestamp: fourMonthsAgo.toString(),
        appAvailableForAllocationVoting: false,
    },
    {
        id: "dapp15-id",
        name: "New DApp 8",
        teamWalletAddress: "0xaaa",
        metadataURI: "ipfs://test15",
        createdAtTimestamp: twoMonthsAgo.toString(),
        appAvailableForAllocationVoting: true,
    },
]

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

const initialStateMock = {
    discovery: {
        featured: mockDapps,
        favorites: [],
        custom: [],
        hasOpenedDiscovery: true,
        connectedApps: [],
        tabsManager: {
            currentTabId: null,
            tabs: [],
        },
    },
}

describe("useNewDApps", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should return new DApps created in the last 3 months", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: mockVeBetterDaoDapps,
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        // Check the result
        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toHaveLength(2)
        expect(result.current.newDapps[0].name).toBe("New DApp 1")
        expect(result.current.newDapps[1].name).toBe("New DApp 2")
    })

    it("should filter out DApps not available for allocation voting", () => {
        // Mock with one DApp not available for voting
        const modifiedVeBetterDaoDapps = [...mockVeBetterDaoDapps]
        modifiedVeBetterDaoDapps[1] = {
            ...modifiedVeBetterDaoDapps[1],
            appAvailableForAllocationVoting: false,
        }
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: modifiedVeBetterDaoDapps,
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: initialStateMock.discovery,
                },
            },
        })

        // Should only include DApp1 (DApp2 is filtered out due to appAvailableForAllocationVoting: false)
        expect(result.current.newDapps).toHaveLength(1)
        expect(result.current.newDapps[0].name).toBe("New DApp 1")
    })

    it("should return newest 10 DApps when no DApps are newer than 3 months", () => {
        // Create 15 old DApps to test the limit
        const extraOldDapps: DiscoveryDApp[] = []
        for (let i = 0; i < 15; i++) {
            extraOldDapps.push({
                name: `Extra Old DApp ${i}`,
                href: `https://extraolddapp${i}.com`,
                createAt: fourMonthsAgo - i * 1000, // Slightly different timestamps for sorting
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: `extra-dapp-${i}`,
            })
        }

        // Create corresponding VeBetterDaoDapps
        const extraVeBetterDaoDapps: VeBetterDaoDapp[] = extraOldDapps.map((dapp, index) => ({
            id: `extra-dapp-${index}`,
            name: dapp.name,
            teamWalletAddress: `0x${index}`,
            metadataURI: `ipfs://extra${index}`,
            createdAtTimestamp: dapp.createAt.toString(),
            appAvailableForAllocationVoting: true,
        }))

        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [...mockVeBetterDaoDapps, ...extraVeBetterDaoDapps],
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: { ...initialStateMock.discovery, featured: extraOldDapps },
                },
            },
        })

        // Should return 10 DApps max when none are newer than 3 months
        expect(result.current.newDapps).toHaveLength(10)
        // Should be sorted by createAt (newest first)
        expect(result.current.newDapps[0].name).toBe("Extra Old DApp 0")
    })

    it("should return maximum 15 new DApps", () => {
        // Create 20 new DApps
        const manyNewDapps: DiscoveryDApp[] = []
        const manyNewVeBetterDaoDapps: VeBetterDaoDapp[] = []

        for (let i = 0; i < 20; i++) {
            const createAt = twoMonthsAgo - i * 1000 // Slightly different timestamps for sorting

            manyNewDapps.push({
                name: `Many New DApp ${i}`,
                href: `https://manynewdapp${i}.com`,
                createAt,
                isCustom: false,
                amountOfNavigations: 0,
                veBetterDaoId: `many-new-dapp-${i}`,
            })

            manyNewVeBetterDaoDapps.push({
                id: `many-new-dapp-${i}`,
                name: `Many New DApp ${i}`,
                teamWalletAddress: `0x${i}`,
                metadataURI: `ipfs://manynew${i}`,
                createdAtTimestamp: createAt.toString(),
                appAvailableForAllocationVoting: true,
            })
        }

        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: manyNewVeBetterDaoDapps,
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: { ...initialStateMock.discovery, featured: manyNewDapps },
                },
            },
        })

        // Should limit to 15 DApps max
        expect(result.current.newDapps).toHaveLength(15)
        // Should be sorted by createAt (newest first)
        expect(result.current.newDapps[0].name).toBe("Many New DApp 0")
    })

    it("should handle loading state correctly", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: { ...initialStateMock.discovery, featured: [] },
                },
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.newDapps).toEqual([])
    })

    it("should handle empty data gracefully", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useNewDApps(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    discovery: { ...initialStateMock.discovery, featured: [] },
                },
            },
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.newDapps).toEqual([])
    })
})
