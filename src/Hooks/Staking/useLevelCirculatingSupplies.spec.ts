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
