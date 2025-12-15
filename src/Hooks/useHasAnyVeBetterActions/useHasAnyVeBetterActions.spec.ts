import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useHasAnyVeBetterActions } from "./useHasAnyVeBetterActions"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

describe("useHasAnyVeBetterActions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return true if any account has VeBetter actions", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({ data: [{}] })
        const { result, waitFor } = renderHook(() => useHasAnyVeBetterActions(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(true)
        })
    })

    it("should return false if no accounts have VeBetter actions", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({ data: [] })
        const { result, waitFor } = renderHook(() => useHasAnyVeBetterActions(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(false)
        })
    })
})
