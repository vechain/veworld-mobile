import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useCollectionMetadata } from "./useCollectionMetadata"

describe("useCollectionMetadata", () => {
    it.skip("should fetch collection metadata correctly", async () => {
        const { result, waitFor } = renderHook(
            () => useCollectionMetadata("0x1ec1d168574603ec35b9d229843b7c2b44bcb770"),
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
