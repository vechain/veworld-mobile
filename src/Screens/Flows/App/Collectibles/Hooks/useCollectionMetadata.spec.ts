import { renderHook } from "@testing-library/react-hooks"
import { useCollectionMetadata } from "./useCollectionMetadata"
import { TestWrapper } from "~Test"

describe("useCollectionMetadata", () => {
    it("should fetch collection metadata correctly", async () => {
        const { result, waitFor } = renderHook(
            () => useCollectionMetadata("0xfc32a9895c78ce00a1047d602bd81ea8134cc32b"),
            {
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
            },
        )

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })
    })
})
