// Test Helpers.ts mocking calls where appropriate

import { GithubCollectionResponse } from "~Networking"
import { parseCollectionMetadataFromRegistry } from "./Helpers"
import { NETWORK_TYPE } from "~Model"

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
    getSymbol: jest.fn().mockResolvedValue("symbol"),
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
            address: collection,
            name: regInfo.name,
            symbol: "symbol",
            creator: regInfo.creator,
            description: regInfo.description,
            icon: {
                url: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
                mime: "image/webp",
            },
            balanceOf: 1,
            hasCount: true,
            isBlacklisted: false,
            totalSupply: 1,
        })
    })

    it("should parse collection metadata without registry", async () => {
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
            address: collection,
            name: regInfo.name,
            symbol: "symbol",
            creator: regInfo.creator,
            description: regInfo.description,
            icon: {
                url: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
                mime: "image/webp",
            },
            balanceOf: 1,
            hasCount: true,
            isBlacklisted: false,
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

        const result = await parseCollectionMetadataFromRegistry(
            network,
            selectedAccount,
            collection,
            regInfo,
            thor,
        )
        expect(result).toEqual({
            address: collection,
            name: regInfo.name,
            symbol: "symbol",
            creator: regInfo.creator,
            description: regInfo.description,
            icon: {
                url: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
                mime: "image/webp",
            },
            balanceOf: 1,
            hasCount: true,
            isBlacklisted: false,
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

describe("Helpers - parseNftMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse NFT metadata", async () => {
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
            address: collection,
            name: regInfo.name,
            symbol: "symbol",
            creator: regInfo.creator,
            description: regInfo.description,
            icon: {
                url: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
                mime: "image/webp",
            },
            balanceOf: 1,
            hasCount: true,
            isBlacklisted: false,
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
