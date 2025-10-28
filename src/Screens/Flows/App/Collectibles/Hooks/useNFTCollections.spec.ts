import { act, renderHook } from "@testing-library/react-hooks"
import { useNFTCollections } from "./useNFTCollections"
import { TestWrapper } from "~Test"

describe("useNFTCollections", () => {
    it("should fetch NFT collections correctly", async () => {
        const { result, waitFor } = renderHook(() => useNFTCollections(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.pages.length).toBe(1)
            expect(result.current.data?.pages[0].collections.length).toBe(0)
            expect(result.current.data?.pages[0].pagination.hasNext).toBe(false)
        })
    })

    it("should fetch NFT collections with pagination correctly", async () => {
        const { result, waitFor } = renderHook(() => useNFTCollections(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [
                            {
                                address: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                                alias: "Test Account",
                                index: 0,
                                rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                                visible: true,
                            },
                        ],
                        selectedAccount: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                    },
                },
            },
        })

        await waitFor(() => {
            expect(result.current.data?.pages.length).toBe(1)
            expect(result.current.data?.pages[0].collections.length).toBe(8)
            expect(result.current.data?.pages[0].pagination.hasNext).toBe(true)
        })

        await act(() => {
            result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.data?.pages.length).toBe(2)
            expect(result.current.data?.pages[1].collections.length).toBe(8)
            expect(result.current.data?.pages[1].pagination.hasNext).toBe(true)
        })
    })
})
