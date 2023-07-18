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
import { URIUtils, error } from "~Utils"
import axios from "axios"

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
    const tokenMetadata = await fetchMetadata(tokenURI)
    const image = URIUtils.convertUriToUrl(
        tokenMetadata?.image ?? NFTPlaceholder,
    )

    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: await getName(collection, thor),
        symbol: await getSymbol(collection, thor),
        creator: notAvailable,
        description: tokenMetadata?.description ?? "",
        image,
        mimeType: await resolveMimeType(image),
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
    const tokenMetadata = await fetchMetadata(tokenURI)

    const image = URIUtils.convertUriToUrl(
        tokenMetadata?.image ?? NFTPlaceholder,
    )

    const nftWithMetadata: NonFungibleToken = {
        ...tokenMetadata,
        id: nft.contractAddress + nft.tokenId + nft.owner,
        name: tokenMetadata?.name ?? notAvailable,
        description: tokenMetadata?.description ?? notAvailable,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        owner: nft.owner,
        tokenURI,
        image,
        mimeType: await resolveMimeType(image),
        isBlacklisted: false,
    }

    return nftWithMetadata
}

export const resolveMimeType = async (resource: string) => {
    try {
        // If it's a data URI parse from the string
        if (resource.startsWith("data:")) {
            const mime = resource.split(";")[0].split(":")[1]
            return mime
        }

        const res = await axios.head(resource)
        const contentType = res.headers["content-type"]
        return contentType ?? "image/png"
    } catch (err) {
        error(err)
    }
    return "image/png"
}
