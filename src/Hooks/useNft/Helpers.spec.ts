// Test Helpers.ts mocking calls where appropriate

import { GithubCollectionResponse, NftItemResponse } from "~Networking"
import {
    parseCollectionMetadataFromRegistry,
    parseCollectionMetadataWithoutRegistry,
    initialiseNFTMetadata,
} from "./Helpers"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { NETWORK_TYPE, NFTMediaType } from "~Model"

const regInfo: GithubCollectionResponse = {
    name: "name",
    creator: "creator",
    description: "description",
    icon: "icon",
    address: "",
    chainData: {
        supportsInterface: {
            erc20: false,
            erc165: false,
            erc712: false,
            erc721: false,
            erc721Metadata: false,
            erc721Enumerable: false,
            erc721Receiver: false,
            erc777: false,
            erc1155: false,
            erc1820: false,
            erc2981: false,
            erc5643: false,
        },
        name: "",
    },
    marketplaces: [{ name: "", link: "" }],
}

jest.mock("~Networking", () => ({
    getNftsForContract: jest.fn().mockResolvedValue({
        data: [
            {
                tokenId: "1",
                owner: "0x123",

                metadata: {
                    name: "name",
                    description: "description",
                    image: "image",
                    external_url: "external_url",
                    attributes: [],
                },
            },
        ],
        pagination: {
            totalElements: 1,
            hasCount: true,
        },
    }),
    getTokenTotalSupply: jest.fn().mockResolvedValue(1),
    getName: jest.fn().mockResolvedValue("name"),
    getSymbol: jest.fn().mockResolvedValue("symbol"),
    getTokenURI: jest
        .fn()
        .mockResolvedValue(
            "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb",
        ),
    getTokenMetaIpfs: jest.fn().mockResolvedValue({
        name: "name",
        description: "description",
        image: "http://google.com/image.png",
        attributes: [],
    }),
    // fetchMetadata: jest.fn().mockResolvedValue({
    //     name: "fetchMetadata-name",
    //     description: "fetchMetadata-description",
    //     image: "http://vechain.org/image.png",
    //     attributes: [],
    // }),
}))

jest.mock("axios", () => ({
    head: jest.fn().mockResolvedValue({
        headers: {
            "content-type": "image/jpg",
        },
    }),
}))

const thor = {
    account: jest.fn(),
} as any

describe("Helpers - parseCollectionMetadataFromRegistry", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse collection metadata from registry", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        const result = await parseCollectionMetadataFromRegistry(
            network,
            selectedAccount,
            collection,
            regInfo,
            thor,
        )
        expect(result).toEqual({
            address: "0x456",
            balanceOf: 1,
            creator: "creator",
            description: "description",
            hasCount: true,
            image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
            mediaType: NFTMediaType.IMAGE,
            isBlacklisted: false,
            mimeType: "image/webp",
            name: "name",
            symbol: "symbol",
            totalSupply: 1,
        })
    })

    it("should throw error if no NFTs found", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        ;(
            require("~Networking") as any
        ).getNftsForContract.mockResolvedValueOnce({
            data: [],
            pagination: {
                totalElements: 0,
                hasCount: true,
            },
        })

        await expect(
            parseCollectionMetadataFromRegistry(
                network,
                selectedAccount,
                collection,
                regInfo,
                thor,
            ),
        ).rejects.toThrow("Failed to parse collection metadata from chain data")
    })
})

describe("Helpers - parseCollectionMetadataWithoutRegistry", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse collection metadata without registry", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        const result = await parseCollectionMetadataWithoutRegistry(
            network,
            selectedAccount,
            collection,
            thor,
            "notAvailable",
            false,
        )
        expect(result).toEqual({
            address: "0x456",
            balanceOf: 1,
            creator: "notAvailable",
            description: "notAvailable",
            hasCount: true,
            image: NFTPlaceHolderLight,
            mediaType: NFTMediaType.IMAGE,
            isBlacklisted: false,
            name: "name",
            symbol: "symbol",
            totalSupply: 1,
        })
    })

    it("should parse default collection if no metadata found", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        // mock fetchMetadata and return undefined
        ;(require("~Networking") as any).getTokenMetaIpfs.mockResolvedValueOnce(
            undefined,
        )

        const result = await parseCollectionMetadataWithoutRegistry(
            network,
            selectedAccount,
            collection,
            thor,
            "notAvailable",
            true,
        )

        expect(result).toEqual({
            address: "0x456",
            balanceOf: 1,
            creator: "notAvailable",
            description: "notAvailable",
            hasCount: true,
            image: NFTPlaceholderDark,
            mediaType: NFTMediaType.IMAGE,
            isBlacklisted: false,
            name: "name",
            symbol: "symbol",
            totalSupply: 1,
        })
    })

    it("should parse correct placeholder image if no metadata found", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        // mock fetchMetadata and return undefined
        ;(require("~Networking") as any).getTokenMetaIpfs.mockResolvedValueOnce(
            undefined,
        )

        const result = await parseCollectionMetadataWithoutRegistry(
            network,
            selectedAccount,
            collection,
            thor,
            "notAvailable",
            false,
        )

        expect(result).toEqual({
            address: "0x456",
            balanceOf: 1,
            creator: "notAvailable",
            description: "notAvailable",
            hasCount: true,
            image: NFTPlaceHolderLight,
            mediaType: NFTMediaType.IMAGE,
            isBlacklisted: false,
            name: "name",
            symbol: "symbol",
            totalSupply: 1,
        })
    })

    it("should throw error if no NFTs found", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        ;(
            require("~Networking") as any
        ).getNftsForContract.mockResolvedValueOnce({
            data: [],
            pagination: {
                totalElements: 0,
                hasCount: true,
            },
        })

        await expect(
            parseCollectionMetadataWithoutRegistry(
                network,
                selectedAccount,
                collection,
                thor,
                "notAvailable",
                true,
            ),
        ).rejects.toThrow("Failed to parse collection metadata from chain data")
    })
})

describe("Helpers - initialiseNFTMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse NFT metadata", async () => {
        const nft: NftItemResponse = {
            tokenId: "1",
            owner: "0x123",
            id: "id",
            contractAddress: "0x0032",
            txId: "0x445543",
            blockNumber: 120,
            blockId: "0x34745",
        }

        const result = await initialiseNFTMetadata(
            nft.tokenId,
            nft.contractAddress,
            nft.owner,
            thor,
            "notAvailable",
            false,
        )

        expect(result).toEqual({
            address: "0x0032",
            description: "notAvailable",
            id: nft.contractAddress + nft.tokenId + nft.owner,
            image: NFTPlaceHolderLight,
            mediaType: NFTMediaType.IMAGE,
            name: "notAvailable",
            owner: "0x123",
            tokenId: "1",
            tokenURI: "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb",
        })
    })
})
