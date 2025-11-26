import { act, renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useIndexerClient } from "~Hooks/useIndexerClient"

import { useNFTCollections } from "./useNFTCollections"

jest.mock("~Hooks/useIndexerClient", () => ({
    useIndexerClient: jest.fn(),
}))

describe("useNFTCollections", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch NFT collections correctly", async () => {
        ;(useIndexerClient as jest.Mock).mockReturnValue({
            GET: jest.fn().mockResolvedValue({ data: { data: ["0x0"], pagination: { hasNext: false } } }),
        })
        const { result, waitFor } = renderHook(() => useNFTCollections(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.pages.length).toBe(1)
            expect(result.current.data?.pages[0].data.length).toBe(1)
            expect(result.current.data?.pages[0].pagination.hasNext).toBe(false)
        })
    })

    it("should fetch NFT collections with pagination correctly", async () => {
        ;(useIndexerClient as jest.Mock).mockReturnValue({
            GET: jest
                .fn()
                .mockResolvedValueOnce({ data: { data: ["0x0"], pagination: { hasNext: true } } })
                .mockResolvedValueOnce({ data: { data: ["0x1"], pagination: { hasNext: false } } }),
        })
        const { result, waitFor } = renderHook(() => useNFTCollections(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data?.pages.length).toBe(1)
            expect(result.current.data?.pages[0].data.length).toBe(1)
            expect(result.current.data?.pages[0].pagination.hasNext).toBe(true)
        })

        await act(() => {
            result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.data?.pages.length).toBe(2)
            expect(result.current.data?.pages[1].data.length).toBe(1)
            expect(result.current.data?.pages[1].pagination.hasNext).toBe(false)
        })
    })
})
