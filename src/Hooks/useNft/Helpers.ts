import {
    GithubCollectionResponse,
    getName,
    getNftsForContract,
    getSymbol,
    getTokenTotalSupply,
    getTokenURI,
} from "~Networking"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import {
    NETWORK_TYPE,
    NFTMediaType,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"

export const parseCollectionMetadataFromRegistry = async (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    regInfo: GithubCollectionResponse,
    thor: Connex.Thor,
): Promise<NonFungibleTokenCollection> => {
    // Call to the indexer to get the NFT count for the collection
    const { pagination } = await getNftsForContract(
        network,
        collection,
        selectedAccount,
        1,
        0,
    )

    if (pagination.totalElements < 1)
        throw new Error("Failed to parse collection metadata from chain data")

    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: regInfo.name,
        symbol: await getSymbol(collection, thor),
        creator: regInfo.creator,
        description: regInfo.description,
        image: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
        mimeType: "image/webp",
        mediaType: NFTMediaType.IMAGE,
        balanceOf: pagination.totalElements,
        hasCount: pagination.hasCount,
        isBlacklisted: false,
        totalSupply: await getTokenTotalSupply(collection, thor),
    }

    return nftCollection
}

export const parseCollectionMetadataWithoutRegistry = async (
    network: NETWORK_TYPE,
    selectedAccount: string,
    collection: string,
    thor: Connex.Thor,
    notAvailable: string,
    isDarkTheme: boolean,
): Promise<NonFungibleTokenCollection> => {
    // Get the first NFT in the collection and use it to parse the collection metadata
    const { pagination } = await getNftsForContract(
        network,
        collection,
        selectedAccount,
        1,
        0,
    )
    if (pagination.totalElements < 1)
        throw new Error("Failed to parse collection metadata from chain data")

    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: await getName(collection, thor),
        symbol: await getSymbol(collection, thor),
        creator: notAvailable,
        description: notAvailable,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
        balanceOf: pagination.totalElements,
        hasCount: pagination.hasCount,
        isBlacklisted: false,
        totalSupply: await getTokenTotalSupply(collection, thor),
    }

    return nftCollection
}

export const initialiseNFTMetadata = async (
    tokenId: string,
    contractAddress: string,
    owner: string,
    thor: Connex.Thor,
    notAvailable: string,
    isDarkTheme: boolean,
): Promise<NonFungibleToken> => {
    const tokenURI = await getTokenURI(tokenId, contractAddress, thor)

    const nftWithMetadata: NonFungibleToken = {
        id: contractAddress + tokenId + owner,
        name: notAvailable,
        description: notAvailable,
        address: contractAddress,
        tokenId: tokenId,
        owner: owner,
        tokenURI,
        image: isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight,
        mediaType: NFTMediaType.IMAGE,
    }

    return nftWithMetadata
}
