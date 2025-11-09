import { TestWrapper, TestHelpers } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useUserNodes } from "./useUserNodes"
import { RootState } from "~Storage/Redux/Types"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"

const { StargateNodeMocks } = TestHelpers.data

const mockQuerySuccess = {
    data: StargateNodeMocks,
    isFetching: false,
    error: undefined,
    isError: false,
}

const mockQueryError = {
    data: undefined,
    isFetching: false,
    error: new Error("Test error"),
    isError: true,
}

const mockQueryLoading = {
    data: undefined,
    isFetching: true,
    error: undefined,
    isError: false,
}

jest.mock("@tanstack/react-query", () => {
    const actualQuery = jest.requireActual("@tanstack/react-query")
    return {
        ...actualQuery,
        useQuery: jest.fn().mockImplementation(({ enabled }) => {
            if (!enabled) {
                return {
                    data: undefined,
                    isLoading: false,
                    error: undefined,
                    isError: false,
                }
            }

            return mockQuerySuccess
        }),
    }
})

jest.mock("~Hooks/useStargateConfig", () => ({
    useStargateConfig: jest.fn().mockReturnValue({
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xNodeManagementAddress",
    }),
}))

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

describe("useUserNodes", () => {
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
                }
            }

            return mockQuerySuccess
        })
    })

    it("should return empty data array when address is undefined", () => {
        const { result } = renderHook(() => useUserNodes(undefined), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it("should return data when address is provided", () => {
        const address = "0x123456789"

        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.data.length).toBe(2)
        expect(result.current.data[0].nodeId).toBe("1")
        expect(result.current.data[1].nodeId).toBe("3")
    })

    it("should handle network type correctly", () => {
        const address = "0x123456789"

        const { result } = renderHook(() => useUserNodes(address), {
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

        expect(result.current.data.length).toBe(2)
    })

    it("should handle error state", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryError)

        const address = "0x123456789"
        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toEqual(new Error("Test error"))
        expect(result.current.data).toEqual([])
    })

    it("should handle loading state", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryLoading)

        const address = "0x123456789"
        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual([])
    })
})
