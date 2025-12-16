import { renderHook } from "@testing-library/react-hooks"
import { useCollectionMetadata } from "./useCollectionMetadata"
import { TestWrapper } from "~Test"

const indexerGet = jest.fn().mockResolvedValue({
    data: [{ tokenId: 1 }],
    pagination: { countLimit: 1, hasNext: false, hasCount: false, totalElements: 1, totalPages: 1 },
})

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

jest.mock("~Networking/NFT", () => ({
    getCachedNftBalanceOf: jest.fn().mockResolvedValue(2),
    getCachedTokenURI: jest
        .fn()
        .mockResolvedValue("ipfs://bafybeifc7nlzpeb6jyokeufehinqhapzhapdavjw75gfbre47jpvrn6y7q"),
}))

jest.mock("~Networking/NFT/getNftCollectionMetadata", () => ({
    getNftCollectionMetadata: jest.fn().mockResolvedValue({ name: "Test", symbol: "TEST", totalSupply: "10" }),
}))

jest.mock("~Hooks/useNFTMetadata", () => ({
    useNFTMetadata: () => ({
        fetchMetadata: jest
            .fn()
            .mockResolvedValue({ name: "Test", description: "TEST", image: "https://example.com/image.png" }),
    }),
}))

jest.mock("~Hooks/useNft/useNFTRegistry", () => ({
    useNFTRegistry: () => ({
        data: [],
    }),
}))

describe("useCollectionMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch collection metadata correctly", async () => {
        const { result, waitFor } = renderHook(
            () => useCollectionMetadata("0x38a59fa7fd7039884465a0ff285b8c4b6fe394ca"),
            {
                wrapper: TestWrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })
    })
})
