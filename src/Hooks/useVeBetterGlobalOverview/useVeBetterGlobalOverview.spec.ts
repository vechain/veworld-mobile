import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useVeBetterGlobalOverview } from "./useVeBetterGlobalOverview"
import { fetchVeBetterGlobalOverview } from "~Networking"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchVeBetterGlobalOverview: jest.fn(),
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
        ;(fetchVeBetterGlobalOverview as jest.Mock).mockResolvedValue(mockData)

        const { result, waitFor } = renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData)
        })
    })

    it("should handle fetch error", async () => {
        ;(fetchVeBetterGlobalOverview as jest.Mock).mockRejectedValue(new Error("Network error"))

        const { result, waitFor } = renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it("should call fetchVeBetterGlobalOverview", async () => {
        ;(fetchVeBetterGlobalOverview as jest.Mock).mockResolvedValue({})

        renderHook(() => useVeBetterGlobalOverview(), {
            wrapper: TestWrapper,
        })

        expect(fetchVeBetterGlobalOverview).toHaveBeenCalledTimes(1)
    })
})
