import {
    GithubCollectionResponse,
    NftForContractResponse,
    getName,
    getNftsForContract,
    getSymbol,
    getTokenTotalSupply,
    getTokenURI,
} from "~Networking"
import { fetchMetadata } from "./fetchMeta"
import { NFTPlaceholder } from "~Assets"
import { NonFungibleTokenCollection } from "~Model"
const allSettled = require("promise.allsettled")

/*
 * Helper functions for useNFTCollections
 */
export const getNFTdataForContract = async (
    contractsForNFTs: string[],
    selectedAccountAddress: string,
    _resultsPerPage: number,
    _page: number = 0,
) => {
    const NFTsForContractPromises: Promise<NftForContractResponse[]>[] = []

    for (const contractAddress of contractsForNFTs) {
        const nfts = getNftsForContract(
            contractAddress,
            selectedAccountAddress,
            _resultsPerPage,
            _page,
        )
        NFTsForContractPromises.push(nfts)
    }

    // resolve promises
    const NFTsForContractRes = await allSettled(NFTsForContractPromises)

    const nftData: NftForContractResponse[] = NFTsForContractRes.map(
        (result: PromiseSettledResult<NftForContractResponse>) => {
            if (result.status === "fulfilled") {
                return result.value
            }
        },
    )

    return { nftData }
}

export const prepareCollectionData = async (
    nft: NftForContractResponse,
    foundCollection: GithubCollectionResponse | undefined,
    thor: Connex.Thor,
    notAvailable: string,
) => {
    const _nft = nft.data[0]

    const tokenURI = await getTokenURI(_nft.tokenId, _nft.contractAddress, thor)

    const nftMeta = await fetchMetadata(tokenURI)

    const nftCollection: NonFungibleTokenCollection = {
        address: foundCollection?.address ?? _nft.contractAddress,
        name: await getName(_nft.contractAddress, thor),
        symbol: await getSymbol(_nft.contractAddress, thor),
        creator: foundCollection?.creator ?? notAvailable,
        description:
            foundCollection?.description ??
            nftMeta?.tokenMetadata.description ??
            "",
        icon: {
            url: foundCollection?.icon
                ? `https://vechain.github.io/nft-registry/${foundCollection?.icon}`
                : nftMeta?.imageUrl ?? NFTPlaceholder,
            mime: nftMeta?.imageType ?? "image/png",
        },
        balanceOf: nft.pagination.totalElements,
        isExactCount: nft.pagination.isExactCount,
        nfts: [],
        isBlacklisted: false,
        totalSupply: await getTokenTotalSupply(_nft.contractAddress, thor),
    }

    return { nftCollection }
}
