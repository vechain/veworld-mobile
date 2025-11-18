import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useFetchValidators } from "./useFetchValidators"
import { RootState } from "~Storage/Redux/Types"
import { defaultMainNetwork, defaultTestNetwork, Validator, ValidatorHubUrls } from "~Constants"

const mockValidators: Validator[] = [
    {
        address: "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a",
        name: "Vechain Foundation",
        location: "Global",
        desc: "Official Vechain Foundation validator node",
        website: "https://vechain.org",
        logo: "vechain-foundation.png",
    },
    {
        address: "0xb4094c25f86d628fdd571afc4077f0d0196afb48",
        name: "Safe Haven Node",
        location: "Europe",
        desc: "Safe Haven validator node",
        website: "https://safehaven.io",
        logo: "safe-haven.png",
    },
]

const mockQuerySuccess = {
    data: mockValidators,
    isLoading: false,
    isFetching: false,
    error: undefined,
    isError: false,
}

const mockQueryLoading = {
    data: undefined,
    isLoading: true,
    isFetching: true,
    error: undefined,
    isError: false,
}

const mockQueryError = {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: new Error("Failed to fetch validators"),
    isError: true,
}

global.fetch = jest.fn()

jest.mock("@tanstack/react-query", () => {
    const actualQuery = jest.requireActual("@tanstack/react-query")
    return {
        ...actualQuery,
        useQuery: jest.fn().mockImplementation(() => mockQuerySuccess),
    }
})

jest.mock("~Hooks/useFetchFeaturedDApps/useVeBetterDaoDapps", () => ({
    useVeBetterDaoDapps: jest.fn().mockReturnValue({
        data: [],
        isLoading: false,
    }),
}))

const preloadedStateMain: Partial<RootState> = {
    networks: {
        customNetworks: [],
        hardfork: {},
        isNodeError: false,
        selectedNetwork: defaultMainNetwork.id,
        showConversionOtherNets: false,
        showTestNetTag: false,
    },
}

const preloadedStateTest: Partial<RootState> = {
    networks: {
        customNetworks: [],
        hardfork: {},
        isNodeError: false,
        selectedNetwork: defaultTestNetwork.id,
        showConversionOtherNets: false,
        showTestNetTag: false,
    },
}

describe("useFetchValidators", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQuerySuccess)
    })

    it("should fetch validators successfully for mainnet", async () => {
        const { result, waitFor } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        await waitFor(() => {
            expect(result.current.validators).toEqual(mockValidators)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.network).toBe("main")
        })
    })

    it("should fetch validators successfully for testnet", async () => {
        const { result, waitFor } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateTest,
            },
        })

        await waitFor(() => {
            expect(result.current.validators).toEqual(mockValidators)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.network).toBe("test")
        })
    })

    it("should handle loading state", async () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryLoading)

        const { result } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        expect(result.current.validators).toBeUndefined()
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isFetching).toBe(true)
    })

    it("should handle error state", async () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryError)

        const { result } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        expect(result.current.validators).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isFetching).toBe(false)
    })

    it("should return correct network for mainnet", () => {
        const { result } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        expect(result.current.network).toBe("main")
    })

    it("should return correct network for testnet", () => {
        const { result } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateTest,
            },
        })

        expect(result.current.network).toBe("test")
    })

    it("should call queryFn that fetches from correct URL for mainnet", async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockValidators),
        })
        global.fetch = mockFetch

        const mockUseQuery = require("@tanstack/react-query").useQuery
        let capturedQueryFn: (() => Promise<Validator[]>) | undefined

        mockUseQuery.mockImplementation((config: any) => {
            capturedQueryFn = config.queryFn
            return mockQuerySuccess
        })

        renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        if (capturedQueryFn) {
            const result = await capturedQueryFn()
            expect(mockFetch).toHaveBeenCalledWith(ValidatorHubUrls.main)
            expect(result).toEqual(mockValidators)
        }
    })

    it("should call queryFn that fetches from correct URL for testnet", async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockValidators),
        })
        global.fetch = mockFetch

        const mockUseQuery = require("@tanstack/react-query").useQuery
        let capturedQueryFn: (() => Promise<Validator[]>) | undefined

        mockUseQuery.mockImplementation((config: any) => {
            capturedQueryFn = config.queryFn
            return mockQuerySuccess
        })

        renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateTest,
            },
        })

        if (capturedQueryFn) {
            const result = await capturedQueryFn()
            expect(mockFetch).toHaveBeenCalledWith(ValidatorHubUrls.test)
            expect(result).toEqual(mockValidators)
        }
    })

    it("should return empty array when no validators are available", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => ({
            data: [],
            isLoading: false,
            isFetching: false,
            error: undefined,
            isError: false,
        }))

        const { result } = renderHook(() => useFetchValidators(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedStateMain,
            },
        })

        expect(result.current.validators).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })
})
