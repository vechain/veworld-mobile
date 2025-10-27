import { renderHook } from "@testing-library/react-hooks"
import { useCollectionMetadata } from "./useCollectionMetadata"
import { TestWrapper } from "~Test"

describe("useCollectionMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch collection metadata correctly", async () => {
        const { result, waitFor } = renderHook(() => useCollectionMetadata("0x0"), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })
    })
})
