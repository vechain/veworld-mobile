import { TestWrapper } from "~Test"
import { useNFTCollections } from "./useNFTCollections"
import { renderHook } from "@testing-library/react-hooks"
import { GithubCollectionResponse } from "~Networking"

const mockResponse: GithubCollectionResponse = {
    address: "0x123",
    name: "Collection",
    creator: "Creator",
    description: "Description",
    icon: "icon.png",
    marketplaces: [{ name: "Marketplace", link: "marketplace.com" }],
    chainData: {
        supportsInterface: {
            erc20: true,
            erc165: true,
            erc712: true,
            erc721: true,
            erc721Metadata: true,
            erc721Enumerable: true,
            erc721Receiver: true,
            erc777: true,
            erc1155: true,
            erc1820: true,
            erc2981: true,
            erc5643: true,
        },
        name: "ChainData",
    },
}

describe("useNFTCollections", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        jest.mock("~Networking", () => ({
            getContractAddresses: () => [],
            getCollectionInfo: () => [mockResponse],
        }))

        const { result, waitForNextUpdate } = renderHook(
            () => useNFTCollections(),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate({
            timeout: 5000,
        })

        expect(result.current).toEqual({
            getCollections: expect.any(Function),
        })
    })
})
