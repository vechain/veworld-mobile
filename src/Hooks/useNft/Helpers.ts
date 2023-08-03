import { GithubCollectionResponse } from "~Networking"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import {
    NETWORK_TYPE,
    NFTMediaType,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"

export const initCollectionMetadataFromRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    regInfo: GithubCollectionResponse,
    notAvailable: string,
): NonFungibleTokenCollection => {
    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: regInfo.name,
        symbol: notAvailable,
        creator: regInfo.creator,
        description: regInfo.description,
        image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
        mimeType: "image/webp",
        mediaType: NFTMediaType.IMAGE,
        balanceOf: -1,
        hasCount: false,
    }

    return nftCollection
}

export const initCollectionMetadataWithoutRegistry = (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    notAvailable: string,
    isDarkTheme: boolean,
): NonFungibleTokenCollection => {
    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: notAvailable,
        symbol: notAvailable,
        creator: notAvailable,
        description: notAvailable,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
        balanceOf: -1,
        hasCount: false,
    }

    return nftCollection
}

export const initialiseNFTMetadata = (
    tokenId: string,
    contractAddress: string,
    owner: string,
    notAvailable: string,
    isDarkTheme: boolean,
): NonFungibleToken => {
    const nftWithMetadata: NonFungibleToken = {
        id: contractAddress + tokenId + owner,
        name: notAvailable,
        description: notAvailable,
        address: contractAddress,
        tokenId: tokenId,
        owner: owner,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
    }

    return nftWithMetadata
}
