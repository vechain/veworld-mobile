import { TestWrapper, TestHelpers } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useUserStargateNfts } from "./useUserStargateNfts"
import { RootState } from "~Storage/Redux/Types"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"

const { StargateNftMocks, StargateNodeMocks } = TestHelpers.data

const mockQuerySuccess = {
    data: StargateNftMocks,
    isFetching: false,
    error: undefined,
    isError: false,
    refetch: jest.fn(),
}

const mockQueryLoading = {
    data: undefined,
    isFetching: true,
    error: undefined,
    isError: false,
    refetch: jest.fn(),
}

const mockQueryError = {
    data: undefined,
    isFetching: false,
    error: new Error("Test error"),
    isError: true,
    refetch: jest.fn(),
}

jest.mock("@tanstack/react-query", () => {
    const actualQuery = jest.requireActual("@tanstack/react-query")
    return {
        ...actualQuery,
        useQuery: jest.fn().mockImplementation(({ enabled }) => {
            if (!enabled) {
                return {
                    data: undefined,
                    isFetching: false,
                    error: undefined,
                    isError: false,
                    refetch: jest.fn(),
                }
            }

            return mockQuerySuccess
        }),
    }
})

jest.mock("~Hooks/useThorClient", () => ({
    useThorClient: jest.fn().mockReturnValue({
        contracts: {
            load: jest.fn(),
        },
    }),
    useMainnetThorClient: jest.fn().mockReturnValue({
        contracts: {
            load: jest.fn(),
        },
    }),
}))

jest.mock("~Constants/Constants/Staking", () => ({
    getStargateNetworkConfig: jest.fn().mockReturnValue({
        STARGATE_NFT_CONTRACT_ADDRESS: "0xStargateNFTContractAddress",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xStargateDelegationContractAddress",
    }),
}))

const preloadedState: Partial<RootState> = {
    networks: {
        customNetworks: [],
        hardfork: {},
        isNodeError: false,
        selectedNetwork: defaultMainNetwork.id,
        showConversionOtherNets: false,
        showTestNetTag: false,
    },
}

describe("useUserStargateNfts", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(({ enabled }: { enabled?: boolean }) => {
            if (!enabled) {
                return {
                    data: undefined,
                    isFetching: false,
                    error: undefined,
                    isError: false,
                    refetch: jest.fn(),
                }
            }

            return mockQuerySuccess
        })
    })

    it("should return empty array when no nodes are provided", () => {
        const { result } = renderHook(() => useUserStargateNfts([], false), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.ownedStargateNfts).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it("should return NFTs data when nodes are provided", () => {
        const { result } = renderHook(() => useUserStargateNfts(StargateNodeMocks, false), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.ownedStargateNfts.length).toBe(3)
        expect(result.current.ownedStargateNfts[0].tokenId).toBe("1")
        expect(result.current.ownedStargateNfts[1].tokenId).toBe("2")
        expect(result.current.ownedStargateNfts[2].tokenId).toBe("3")
        expect(result.current.isLoading).toBe(false)
    })

    it("should handle loading state when isLoadingNodes is true", () => {
        const { result } = renderHook(() => useUserStargateNfts(StargateNodeMocks, true), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should handle loading state from useQuery", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryLoading)

        const { result } = renderHook(() => useUserStargateNfts(StargateNodeMocks, false), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.ownedStargateNfts).toEqual([])
    })

    it("should handle error state", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryError)

        const { result } = renderHook(() => useUserStargateNfts(StargateNodeMocks, false), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.hasCallErrors).toBe(true)
        expect(result.current.error).toEqual(new Error("Test error"))
        expect(result.current.ownedStargateNfts).toEqual([])
    })

    it("should handle network type changes correctly", () => {
        const { result } = renderHook(() => useUserStargateNfts(StargateNodeMocks, false), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    networks: {
                        customNetworks: [],
                        hardfork: {},
                        isNodeError: false,
                        selectedNetwork: defaultTestNetwork.id,
                        showConversionOtherNets: false,
                        showTestNetTag: false,
                    },
                },
            },
        })

        expect(result.current.ownedStargateNfts.length).toBe(3)
    })
})
