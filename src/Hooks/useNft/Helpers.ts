import {
    GithubCollectionResponse,
    NftItemResponse,
    getName,
    getNftsForContract,
    getSymbol,
    getTokenTotalSupply,
    getTokenURI,
} from "~Networking"
import { fetchMetadata } from "./fetchMeta"
import { NFTPlaceholder } from "~Assets"
import {
    NETWORK_TYPE,
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
        0,
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
        icon: {
            url: `https://vechain.github.io/nft-registry/${regInfo.icon}`,
            mime: "image/webp",
        },
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
): Promise<NonFungibleTokenCollection> => {
    // Get the first NFT in the collection and use it to parse the collection metadata
    const { data, pagination } = await getNftsForContract(
        network,
        collection,
        selectedAccount,
        1,
        0,
    )
    if (pagination.totalElements < 1)
        throw new Error("Failed to parse collection metadata from chain data")

    const tokenURI = await getTokenURI(data[0].tokenId, collection, thor)
    const nftMeta = await fetchMetadata(tokenURI)

    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: await getName(collection, thor),
        symbol: await getSymbol(collection, thor),
        creator: notAvailable,
        description: nftMeta?.tokenMetadata.description ?? "",
        icon: {
            url: nftMeta?.imageUrl ?? NFTPlaceholder,
            mime: nftMeta?.imageType ?? "image/png",
        },
        balanceOf: pagination.totalElements,
        hasCount: pagination.hasCount,
        isBlacklisted: false,
        totalSupply: await getTokenTotalSupply(collection, thor),
    }
    return nftCollection
}

export const parseNftMetadata = async (
    network: NETWORK_TYPE,
    nft: NftItemResponse,
    thor: Connex.Thor,
    notAvailable: string,
): Promise<NonFungibleToken> => {
    const tokenURI = await getTokenURI(nft.tokenId, nft.contractAddress, thor)
    const nftMeta = await fetchMetadata(tokenURI)

    const nftWithMetadata: NonFungibleToken = {
        id: nft.contractAddress + nft.tokenId + nft.owner,
        tokenId: nft.tokenId,
        owner: nft.owner,
        tokenURI,
        ...nftMeta?.tokenMetadata,
        icon: {
            url: nftMeta?.imageUrl ?? NFTPlaceholder,
            mime: nftMeta?.imageType ?? "image/png",
        },
        image: nftMeta?.imageUrl ?? NFTPlaceholder,
        belongsToCollectionAddress: nft.contractAddress,
        isBlacklisted: false,
        name: nftMeta?.tokenMetadata.name ?? notAvailable,
    }

    return nftWithMetadata
}
