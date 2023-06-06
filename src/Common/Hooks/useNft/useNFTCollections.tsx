import { useCallback } from "react"
const allSettled = require("promise.allsettled")
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import {
    GithubCollectionResponse,
    NftForContractResponse,
    getCollectionInfo,
    getContractAddresses,
    getName,
    getNftsForContract,
    getSymbol,
    getTokenURI,
} from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setCollections,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { fetchMetadata } from "./fetchMeta"
import { NFTPlaceholder } from "~Assets"
import { error } from "~Common/Logger"

export const useNFTCollections = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const dispatch = useAppDispatch()

    const getCollections = useCallback(
        async (_page: number, _resultsPerPage: number = 20) => {
            try {
                // Get contract addresses for nfts owned by ownerAddress
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        selectedAccount.address,
                        _resultsPerPage,
                        _page,
                    )

                // get nft collection info from GitHub registry
                const collectionRegistryInfo = await getCollectionInfo(
                    network.type,
                )

                // Get nfts for each contract address
                const { nftData } = await getNFTdataForContract(
                    contractsForNFTs,
                    selectedAccount.address,
                    _resultsPerPage,
                )

                const _nftCollections: NonFungibleTokenCollection[] = []

                // loop over the nnft collections
                for (const nft of nftData) {
                    // find collection from GH registry
                    const foundCollection = collectionRegistryInfo.find(
                        col => col.address === nft.data[0].contractAddress,
                    )

                    const { nftCollection } = await prepareCollectionData(
                        nft,
                        foundCollection,
                        selectedAccount.address,
                        thor,
                    )

                    _nftCollections.push(nftCollection)
                }

                // set collections to store
                dispatch(
                    setCollections({
                        collections: _nftCollections,
                        pagination,
                    }),
                )
            } catch (e) {
                error("useNFTCollections", e)
            }
        },
        [dispatch, network.type, selectedAccount.address, thor],
    )

    return { getCollections }
}

/*
 * Helper functions for useNFTCollections
 */
const getNFTdataForContract = async (
    contractsForNFTs: string[],
    selectedAccountAddress: string,
    _resultsPerPage: number,
) => {
    const NFTsForContractPromises: Promise<NftForContractResponse[]>[] = []

    for (const contractAddress of contractsForNFTs) {
        const nfts = getNftsForContract(
            contractAddress,
            selectedAccountAddress,
            _resultsPerPage,
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

const prepareCollectionData = async (
    nft: NftForContractResponse,
    foundCollection: GithubCollectionResponse | undefined,
    selectedAccountAddress: string,
    thor: Connex.Thor,
) => {
    const _nft = nft.data[0]

    const tokenURI = await getTokenURI(_nft.tokenId, _nft.contractAddress, thor)
    const nftMeta = await fetchMetadata(tokenURI)

    const nftCollection: NonFungibleTokenCollection = {
        address: _nft.contractAddress,
        name: await getName(_nft.contractAddress, thor),
        symbol: await getSymbol(_nft.contractAddress, thor),
        creator: foundCollection?.creator ?? "N/A",
        description: foundCollection?.description ?? "",
        icon: foundCollection?.icon
            ? `https://vechain.github.io/nft-registry/${foundCollection?.icon}`
            : nftMeta?.imageUrl ?? NFTPlaceholder,
        balanceOf: nft.pagination.totalElements,
        nfts: [],
    }

    return { nftCollection }
}
