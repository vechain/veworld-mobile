import { renderHook } from "@testing-library/react-hooks"
import { useCollectibleMetadata } from "~Hooks/useCollectibleMetadata"
import { useCollectibleDetails } from "./useCollectibleDetails"
import { TestWrapper } from "~Test"

jest.mock("~Hooks/useCollectibleMetadata", () => ({
    useCollectibleMetadata: jest.fn(),
}))

const getNftNameAndSymbol = jest.fn()

jest.mock("~Networking/NFT/getNftCollectionMetadata", () => ({
    getNftNameAndSymbolOptions: jest
        .fn()
        .mockImplementation((...args: any[]) => ({ ...args[0], queryFn: () => getNftNameAndSymbol() })),
}))

describe("useCollectibleDetails", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should use the collectible metadata name if present", async () => {
        getNftNameAndSymbol.mockResolvedValue({ name: "COLL", symbol: "C O L" })
        ;(useCollectibleMetadata as jest.Mock).mockReturnValue({
            data: {
                name: "NFT",
                description: "Test desc",
            },
        })

        const { result, waitFor } = renderHook(() => useCollectibleDetails({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.name).toBe("NFT")
            expect(result.current.description).toBe("Test desc")
        })
    })
    it("should use the collection name if metadata name is not present", async () => {
        getNftNameAndSymbol.mockResolvedValue({ name: "COLL", symbol: "C O L" })
        ;(useCollectibleMetadata as jest.Mock).mockReturnValue({
            data: {
                description: "Test desc",
            },
        })

        const { result, waitFor } = renderHook(() => useCollectibleDetails({ address: "0x0", tokenId: "1" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.name).toBe("COLL")
            expect(result.current.description).toBe("Test desc")
        })
    })
})
