// Test Helpers.ts mocking calls where appropriate

import { GithubCollectionResponse, NftItemResponse } from "~Networking"
import {
    initCollectionMetadataFromRegistry,
    initCollectionMetadataWithoutRegistry,
    initialiseNFTMetadata,
} from "./Helpers"
import { NFTPlaceHolderLight } from "~Assets"
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

describe("Helpers - initCollectionMetadataFromRegistry", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse collection metadata from registry", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        const result = initCollectionMetadataFromRegistry(
            network,
            selectedAccount,
            collection,
            regInfo,
        )
        expect(result).toEqual({
            id: "0x456",
            address: "0x456",
            creator: "creator",
            description: "description",
            image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
            mediaType: NFTMediaType.IMAGE,
            mimeType: "image/webp",
            name: "name",
            symbol: "",
            updated: false,
            fromRegistry: true,
        })
    })
})

describe("Helpers - initCollectionMetadataWithoutRegistry", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should parse collection metadata without registry", async () => {
        const network = NETWORK_TYPE.MAIN
        const selectedAccount = "0x123"
        const collection = "0x456"

        const result = initCollectionMetadataWithoutRegistry(
            network,
            selectedAccount,
            collection,
            "notAvailable",
        )
        expect(result).toEqual({
            id: "0x456",
            address: "0x456",
            creator: "notAvailable",
            description: "notAvailable",
            mediaType: NFTMediaType.UNKNOWN,
            name: "",
            symbol: "",
            updated: false,
            fromRegistry: false,
        })
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

        const result = initialiseNFTMetadata(
            nft.tokenId,
            nft.contractAddress,
            nft.owner,
            false,
        )

        expect(result).toEqual({
            address: "0x0032",
            description: "",
            id: nft.contractAddress + nft.tokenId + nft.owner,
            image: NFTPlaceHolderLight,
            mediaType: NFTMediaType.IMAGE,
            name: "",
            owner: "0x123",
            tokenId: "1",
            updated: false,
        })
    })
})
