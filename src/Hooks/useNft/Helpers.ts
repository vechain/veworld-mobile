import { GithubCollectionResponse } from "~Networking"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import {
    NETWORK_TYPE,
    NFTMediaType,
    NonFungibleToken,
    NftCollection,
} from "~Model"

export const initCollectionMetadataFromRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    regInfo: GithubCollectionResponse,
): NftCollection => {
    const nftCollection: NftCollection = {
        id: collection,
        address: collection,
        name: regInfo.name,
        symbol: "",
        creator: regInfo.creator,
        description: regInfo.description,
        image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
        mimeType: "image/webp",
        mediaType: NFTMediaType.IMAGE,
        balanceOf: -1,
        hasCount: false,
        updated: false,
    }

    return nftCollection
}

export const initCollectionMetadataWithoutRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    notAvailable: string,
    isDarkTheme: boolean,
): NftCollection => {
    const nftCollection: NftCollection = {
        id: collection,
        address: collection,
        name: "",
        symbol: "",
        creator: notAvailable,
        description: notAvailable,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
        balanceOf: -1,
        hasCount: false,
        updated: false,
    }

    return nftCollection
}

export const initialiseNFTMetadata = (
    tokenId: string,
    contractAddress: string,
    owner: string,
    isDarkTheme: boolean,
): NonFungibleToken => {
    const nftWithMetadata: NonFungibleToken = {
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

    return nftWithMetadata
}
