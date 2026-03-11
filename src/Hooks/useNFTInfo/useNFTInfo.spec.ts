import { renderHook } from "@testing-library/react-hooks"
import { useNFTInfo } from "./useNFTInfo"
import { getName, getTokenURI } from "~Networking"
import * as logger from "~Utils/Logger/Logger"
import { NFTMediaType, NFTMetadata } from "~Model"
import { useThorClient } from "~Hooks/useThorClient"
import { waitFor } from "@testing-library/react-native"

jest.mock("~Networking", () => ({
    getName: jest.fn(),
    getTokenURI: jest.fn(),
    getNftBalanceOf: jest.fn(),
}))

const fetchMetadata = jest.fn()

jest.mock("~Hooks/useNFTMetadata", () => {
    return {
        useNFTMetadata: () => ({
            fetchMetadata,
        }),
    }
})

jest.mock("~Hooks/useThorClient", () => ({
    useThorClient: jest.fn(),
}))

jest.mock("~Utils/Logger/Logger", () => ({
    warn: jest.fn(),
}))

jest.mock("axios", () => {
    const original = jest.requireActual("axios") // Step 2.
    return {
        ...original,
        head: jest.fn().mockResolvedValue({
            headers: {
                "content-type": "image/jpg",
            },
        }),
    }
})

describe("useNFTInfo", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch NFT info correctly", async () => {
        const tokenId = "tokenId1"
        const thor = { genesis: { id: "blah" } }
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"
        const address = "contractAddress1"
        const nftMetaMock: NFTMetadata = {
            name: "NFT Name",
            description: "NFT Description",
            image: "http://nft.image",
            mediaType: NFTMediaType.IMAGE,
        }

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        fetchMetadata.mockResolvedValue(nftMetaMock)
        ;(useThorClient as jest.Mock).mockReturnValue(thor)

        const { result } = renderHook(() => useNFTInfo(tokenId, address))

        await waitFor(() => {
            expect(result.current.collectionName).toEqual(nameMock)
            expect(result.current.tokenMetadata).toEqual(nftMetaMock)
            expect(result.current.isMediaLoading).toBeFalsy()
            expect(getTokenURI).toHaveBeenCalledWith(tokenId, address, thor)
            expect(getName).toHaveBeenCalledWith(address, thor)
            expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
        })
    })

    it("should handle error when fetching NFT info", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = { genesis: { id: "blah" } }
        const errorMock = new Error("Error")

        ;(getTokenURI as jest.Mock).mockRejectedValue(errorMock)
        ;(getName as jest.Mock).mockRejectedValue(errorMock)
        fetchMetadata.mockResolvedValue(errorMock)
        ;(useThorClient as jest.Mock).mockReturnValue(thor)

        const consoleErrorSpy = jest.spyOn(logger, "warn")

        const { result } = renderHook(() => useNFTInfo(tokenId, contractAddress))

        await waitFor(() => {
            expect(result.current.isMediaLoading).toBeFalsy()
        })

        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(result.current.collectionName).toBeUndefined()
        expect(result.current.tokenMetadata).toBeUndefined()
    })

    it("should handle error when token uri generates error", async () => {
        const tokenId = "tokenId1"
        const contractAddress = "contractAddress1"
        const thor = { genesis: { id: "blah" } }
        const tokenUriMock = "http://token.uri"
        const nameMock = "NFT Collection"

        const consoleErrorSpy = jest.spyOn(logger, "warn")

        ;(getTokenURI as jest.Mock).mockResolvedValue(tokenUriMock)
        ;(getName as jest.Mock).mockResolvedValue(nameMock)
        fetchMetadata.mockRejectedValueOnce(new Error("Error"))
        ;(useThorClient as jest.Mock).mockReturnValue(thor)

        const { result } = renderHook(() => useNFTInfo(tokenId, contractAddress))

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled()
            expect(result.current.collectionName).toEqual(nameMock)
            expect(result.current.isMediaLoading).toBeFalsy()
            expect(getTokenURI).toHaveBeenCalledWith(tokenId, contractAddress, thor)
            expect(getName).toHaveBeenCalledWith(contractAddress, thor)
            expect(fetchMetadata).toHaveBeenCalledWith(tokenUriMock)
        })
    })
})
