import { TestWrapper } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useLevelCirculatingSupplies } from "./useLevelCirculatingSupplies"

const mockQueryLoading = {
    data: undefined,
    isLoading: true,
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

            return {
                data: [25, 20, 15, 10, 5, 3, 10, 15, 20, 25],
                isLoading: false,
                error: undefined,
                isError: false,
            }
        }),
    }
})

jest.mock("~Hooks/useThorClient", () => ({
    useMainnetThorClient: jest.fn().mockReturnValue({
        contracts: {
            load: jest.fn(),
        },
    }),
}))

jest.mock("~Hooks/useStargateConfig", () => ({
    STARGATE_NFT_CONTRACT_ADDRESS: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7",
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB",
    LEGACY_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302",
    STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e",
}))

describe("useLevelCirculatingSupplies", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the level circulating supplies", async () => {
        const { result, waitFor } = renderHook(() => useLevelCirculatingSupplies(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data).toEqual([25, 20, 15, 10, 5, 3, 10, 15, 20, 25])
        })
    })

    it("should return undefined if the thor client is not available", async () => {
        const mockUseQuery = require("@tanstack/react-query").useQuery
        mockUseQuery.mockImplementation(() => mockQueryLoading)
        const { result } = renderHook(() => useLevelCirculatingSupplies(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })
})
