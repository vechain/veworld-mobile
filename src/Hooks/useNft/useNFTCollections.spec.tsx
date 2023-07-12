import { TestWrapper } from "~Test"
import { useNFTCollections } from "./useNFTCollections"
import { renderHook } from "@testing-library/react-hooks"

describe("useNFTCollections", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        jest.mock("~Networking", () => ({
            getContractAddresses: () => [],
        }))

        const { result } = renderHook(() => useNFTCollections(), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            getCollections: expect.any(Function),
        })
    })
})
