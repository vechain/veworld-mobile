import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useHasAnyVeBetterActions } from "./useHasAnyVeBetterActions"
import { fetchVeBetterActions } from "~Networking"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchVeBetterActions: jest.fn(),
}))

describe("useHasAnyVeBetterActions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return true if any account has VeBetter actions", async () => {
        ;(fetchVeBetterActions as jest.Mock).mockResolvedValue({ data: [{}] })
        const { result, waitFor } = renderHook(() => useHasAnyVeBetterActions(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(true)
        })
    })

    it("should return false if no accounts have VeBetter actions", async () => {
        ;(fetchVeBetterActions as jest.Mock).mockResolvedValue({ data: [] })
        const { result, waitFor } = renderHook(() => useHasAnyVeBetterActions(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(false)
        })
    })
})
