import { renderHook } from "@testing-library/react-hooks"
import { useNonFungibleTokenInfo } from "./useNonFungibleTokenInfo"
import { useThor } from "~Components"
import { getName, getTokenURI } from "~Networking"
import * as logger from "~Utils/Logger/Logger"
import { NFTMediaType, TokenMetadata } from "~Model"

jest.mock("~Networking", () => ({
    getName: jest.fn(),
    getTokenURI: jest.fn(),
    getNftBalanceOf: jest.fn(),
}))

const fetchMetadata = jest.fn()

jest.mock("~Hooks/useTokenMetadata", () => {
    return {
        useTokenMetadata: () => ({
            fetchMetadata,
        }),
    }
})

jest.mock("~Components", () => ({
    useThor: jest.fn(),
}))

jest.mock("~Utils/Logger/Logger", () => ({
    error: jest.fn(),
}))

jest.mock("axios", () => ({
    head: jest.fn().mockResolvedValue({
        headers: {
            "content-type": "image/jpg",
        },
    }),
}))

describe("useNonFungibleTokenInfo", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch NFT info correctly", async () => {
        const tokenId = "tokenId1"
        const thor = { genesis: { id: "blah" } }
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"
        const address = "contractAddress1"
        const nftMetaMock: TokenMetadata = {
            name: "NFT Name",
            description: "NFT Description",
            image: "http://nft.image",
            mediaType: NFTMediaType.IMAGE,
        }

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        fetchMetadata.mockResolvedValue(nftMetaMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, address),
        )

        await waitForNextUpdate({ timeout: 10000 })

        expect(result.current.collectionName).toEqual(nameMock)
        expect(result.current.tokenMetadata).toEqual(nftMetaMock)
        expect(result.current.isMediaLoading).toBeFalsy()
        expect(getTokenURI).toHaveBeenCalledWith(tokenId, address, thor)
        expect(getName).toHaveBeenCalledWith(address, thor)
        expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
    })

    it("should handle error when fetching NFT info", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = { genesis: { id: "blah" } }
        const errorMock = new Error("Error")

        ;(getTokenURI as jest.Mock).mockRejectedValue(errorMock)
        ;(getName as jest.Mock).mockRejectedValue(errorMock)
        fetchMetadata.mockResolvedValue(errorMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const consoleErrorSpy = jest.spyOn(logger, "error")

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, contractAddress),
        )

        await waitForNextUpdate({ timeout: 10000 })

        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(result.current.collectionName).toBeUndefined()
        expect(result.current.tokenMetadata).toBeUndefined()
        expect(result.current.isMediaLoading).toBeFalsy()
    })

    it("should handle error when token uri generates error", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = { genesis: { id: "blah" } }
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"

        const consoleErrorSpy = jest.spyOn(logger, "error")

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        fetchMetadata.mockRejectedValueOnce(new Error("Error"))
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, contractAddress),
        )

        await waitForNextUpdate({ timeout: 10000 })

        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(result.current.collectionName).toEqual(nameMock)
        expect(result.current.isMediaLoading).toBeFalsy()
        expect(getTokenURI).toHaveBeenCalledWith(tokenId, contractAddress, thor)
        expect(getName).toHaveBeenCalledWith(contractAddress, thor)
        expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
    })
})
