import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useVeBetterGlobalOverview } from "./useVeBetterGlobalOverview"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

describe("useVeBetterGlobalOverview", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return global overview data when fetch is successful", async () => {
        const mockData = {
            totalUsers: 1000,
            totalActions: 5000,
            totalImpact: {
                carbon: 2500,
                plastic: 1500,
            },
        }
        ;(indexerGet as jest.Mock).mockResolvedValue(mockData)

        const { result, waitFor } = renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData)
        })
    })

    it("should handle fetch error", async () => {
        ;(indexerGet as jest.Mock).mockRejectedValue(new Error("Network error"))

        const { result, waitFor } = renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it("should call fetchVeBetterGlobalOverview", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({})

        renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        expect(indexerGet).toHaveBeenCalledTimes(1)
    })
})
