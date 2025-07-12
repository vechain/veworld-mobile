import { TestWrapper, TestHelpers } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useUserNodes } from "./useUserNodes"

const { StargateNodeMocks } = TestHelpers.data

const mockQuerySuccess = {
    data: StargateNodeMocks,
    isLoading: false,
    error: undefined,
    isError: false,
}

const mockQueryError = {
    data: undefined,
    isLoading: false,
    error: new Error("Test error"),
    isError: true,
}

const mockQueryLoading = {
    data: undefined,
    isLoading: true,
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

jest.mock("~Constants/Constants/Staking", () => ({
    getStartgatNetworkConfig: jest.fn().mockReturnValue({
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xNodeManagementAddress",
    }),
}))

jest.mock("~Hooks/useBlockchainNetwork", () => ({
    useBlockchainNetwork: jest.fn().mockReturnValue({
        network: {
            type: "mainnet",
        },
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

describe("useUserNodes", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(({ enabled }: { enabled?: boolean }) => {
            if (!enabled) {
                return {
                    data: undefined,
                    isLoading: false,
                    error: undefined,
                    isError: false,
                }
            }

            return mockQuerySuccess
        })
    })

    it("should return empty stargateNodes array when address is undefined", () => {
        const { result } = renderHook(() => useUserNodes(undefined), {
            wrapper: TestWrapper,
        })

        expect(result.current.stargateNodes).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it("should return stargateNodes when address is provided", () => {
        const address = "0x123456789"

        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        expect(result.current.stargateNodes.length).toBe(2)
        expect(result.current.stargateNodes[0].nodeId).toBe(1)
        expect(result.current.stargateNodes[1].nodeId).toBe(3)
    })

    it("should filter out legacy nodes", () => {
        const address = "0x123456789"

        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        const legacyNodeExists = result.current.stargateNodes.some(node => node.nodeId === 2)
        expect(legacyNodeExists).toBe(false)
    })

    it("should handle network type correctly", () => {
        require("~Hooks/useBlockchainNetwork").useBlockchainNetwork.mockReturnValueOnce({
            network: {
                type: "testnet",
            },
        })

        const address = "0x123456789"

        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        expect(result.current.stargateNodes.length).toBe(2)
    })

    it("should handle error state", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryError)

        const address = "0x123456789"
        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toEqual(new Error("Test error"))
        expect(result.current.stargateNodes).toEqual([])
    })

    it("should handle loading state", () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryLoading)

        const address = "0x123456789"
        const { result } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.stargateNodes).toEqual([])
    })
})
