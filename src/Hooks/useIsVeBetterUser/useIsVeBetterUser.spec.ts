import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useIsVeBetterUser } from "./useIsVeBetterUser"
import { fetchVeBetterActions } from "~Networking"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchVeBetterActions: jest.fn(),
}))

describe("useIsVeBetterUser", () => {
    it("should return true if the number of actions is > 0", async () => {
        ;(fetchVeBetterActions as jest.Mock).mockResolvedValue({ data: [{}] })
        const { result, waitFor } = renderHook(() => useIsVeBetterUser(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(true)
        })
    })
    it("should return false if the number of actions is 0", async () => {
        ;(fetchVeBetterActions as jest.Mock).mockResolvedValue({ data: [] })
        const { result, waitFor } = renderHook(() => useIsVeBetterUser(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(false)
        })
    })
})
