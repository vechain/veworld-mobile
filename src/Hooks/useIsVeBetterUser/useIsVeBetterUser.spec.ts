import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useIsVeBetterUser } from "./useIsVeBetterUser"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

describe("useIsVeBetterUser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return true if the number of actions is > 0", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({ data: [{}] })
        const { result, waitFor } = renderHook(() => useIsVeBetterUser(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(true)
        })
    })
    it("should return false if the number of actions is 0", async () => {
        ;(indexerGet as jest.Mock).mockResolvedValue({ data: [] })
        const { result, waitFor } = renderHook(() => useIsVeBetterUser(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBe(false)
        })
    })
})
