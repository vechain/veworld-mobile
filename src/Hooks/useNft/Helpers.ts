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
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import {
    NETWORK_TYPE,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"
import { URIUtils, error } from "~Utils"
import axios from "axios"
import { NFT_MIME_TYPE_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

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
    isDarkTheme: boolean,
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
        tokenMetadata?.image ??
            (isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight),
    )

    const nftCollection: NonFungibleTokenCollection = {
        address: collection,
        name: await getName(collection, thor),
        symbol: await getSymbol(collection, thor),
        creator: notAvailable,
        description: tokenMetadata?.description ?? "",
        image,
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
    isDarkTheme: boolean,
): Promise<NonFungibleToken> => {
    const tokenURI = await getTokenURI(nft.tokenId, nft.contractAddress, thor)
    const tokenMetadata = await fetchMetadata(tokenURI)

    const image = URIUtils.convertUriToUrl(
        tokenMetadata?.image ??
            (isDarkTheme ? NFTPlaceholderDark : NFTPlaceHolderLight),
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

        const res = await axios.head(URIUtils.convertUriToUrl(resource), {
            timeout: NFT_MIME_TYPE_AXIOS_TIMEOUT,
        })

        const contentType = res.headers["content-type"]
        return contentType ?? "image/png"
    } catch (err) {
        error(`Failed to resolve mime type for ${resource}`, err)
    }
    return "image/png"
}
