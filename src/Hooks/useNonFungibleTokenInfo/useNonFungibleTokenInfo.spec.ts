import { renderHook } from "@testing-library/react-hooks"
import { useNonFungibleTokenInfo } from "./useNonFungibleTokenInfo"
import { useThor } from "~Components"
import { fetchMetadata } from "~Hooks/useNft/fetchMeta"
import { getName, getTokenURI } from "~Networking"
import * as logger from "~Utils/Logger/Logger"
import { TokenMetadata } from "~Model"

jest.mock("~Networking", () => ({
    getName: jest.fn(),
    getTokenURI: jest.fn(),
}))

jest.mock("~Hooks/useNft/fetchMeta", () => ({
    fetchMetadata: jest.fn(),
}))

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
        const contractAddress = "contractAddress1"
        const thor = "thor"
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"
        const nftMetaMock: TokenMetadata = {
            name: "NFT Name",
            description: "NFT Description",
            image: "http://nft.image",
        }

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        ;(fetchMetadata as jest.Mock).mockResolvedValue(nftMetaMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, contractAddress),
        )

        await waitForNextUpdate({ timeout: 5000 })

        expect(result.current.tokenUri).toEqual(tokenUriMock)
        expect(result.current.collectionName).toEqual(nameMock)
        expect(result.current.tokenMetadata).toEqual(nftMetaMock)
        expect(result.current.tokenImage).toEqual(nftMetaMock.image)
        expect(result.current.tokenMime).toEqual("image/jpg")
        expect(result.current.isMediaLoading).toBeFalsy()
        expect(getTokenURI).toHaveBeenCalledWith(tokenId, contractAddress, thor)
        expect(getName).toHaveBeenCalledWith(contractAddress, thor)
        expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
    })

    it("should handle error when fetching NFT info", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = "thor"
        const errorMock = new Error("Error")

        ;(getTokenURI as jest.Mock).mockRejectedValue(errorMock)
        ;(getName as jest.Mock).mockRejectedValue(errorMock)
        ;(fetchMetadata as jest.Mock).mockRejectedValue(errorMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const consoleErrorSpy = jest.spyOn(logger, "error")

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, contractAddress),
        )
        await waitForNextUpdate({ timeout: 5000 })

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
        expect(result.current.tokenUri).toBeUndefined()
        expect(result.current.collectionName).toBeUndefined()
        expect(result.current.tokenMetadata).toBeUndefined()
        expect(result.current.tokenImage).toBeUndefined()
        expect(result.current.tokenMime).toBeUndefined()
        expect(result.current.isMediaLoading).toBeFalsy()
    })

    it("should handle error when token uri generates error", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = "thor"
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"

        const errorMock = new Error("Error")

        const consoleErrorSpy = jest.spyOn(logger, "error")

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        ;(fetchMetadata as jest.Mock).mockRejectedValue(errorMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const { result, waitForNextUpdate } = renderHook(() =>
            useNonFungibleTokenInfo(tokenId, contractAddress),
        )

        await waitForNextUpdate({ timeout: 5000 })

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
        expect(result.current.tokenUri).toEqual(tokenUriMock)
        expect(result.current.collectionName).toEqual(nameMock)
        expect(result.current.tokenMetadata).toBeUndefined()
        expect(result.current.tokenImage).toBeUndefined()
        expect(result.current.tokenMime).toBeUndefined()
        expect(result.current.isMediaLoading).toBeFalsy()
        expect(getTokenURI).toHaveBeenCalledWith(tokenId, contractAddress, thor)
        expect(getName).toHaveBeenCalledWith(contractAddress, thor)
        expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
    })
})
