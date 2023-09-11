import { GithubCollectionResponse } from "~Networking"
import { NFTPlaceholderDark, NFTPlaceHolderLight } from "~Assets"
import {
    NETWORK_TYPE,
    NftCollection,
    NFTMediaType,
    NonFungibleToken,
} from "~Model"

export const initCollectionMetadataFromRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    regInfo: GithubCollectionResponse,
): NftCollection => {
    return {
        id: collection,
        address: collection,
        name: regInfo.name,
        symbol: "",
        creator: regInfo.creator,
        description: regInfo.description,
        image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
        mimeType: "image/webp",
        mediaType: NFTMediaType.IMAGE,
        updated: false,
        fromRegistry: true,
    }
}

export const initCollectionMetadataWithoutRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    notAvailable: string,
): NftCollection => {
    return {
        id: collection,
        address: collection,
        name: "",
        symbol: "",
        creator: notAvailable,
        description: notAvailable,
        mediaType: NFTMediaType.UNKNOWN,
        updated: false,
        fromRegistry: false,
    }
}

export const initialiseNFTMetadata = (
    tokenId: string,
    contractAddress: string,
    owner: string,
    isDarkTheme: boolean,
): NonFungibleToken => {
    return {
        id: contractAddress + tokenId + owner,
        name: "",
        description: "",
        address: contractAddress,
        tokenId: tokenId,
        owner: owner,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
        updated: false,
    }
}
