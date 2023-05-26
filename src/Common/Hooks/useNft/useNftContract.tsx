import { useCallback, useEffect, useState } from "react"
import { error } from "~Common/Logger"
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import {
    getNftsForContract,
    NftForContractResponse,
    getCollectionInfo,
    getContractAddresses,
    getTokenURI,
    getNftBalanceOf,
    getOwnerOf,
    getName,
    getSymbol,
} from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
const allSettled = require("promise.allsettled")

export const useNftContract = () => {
    const thor = useThor()

    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [nftCollections, setNftCollections] = useState<
        NonFungibleTokenCollection[]
    >([])

    const getNFTsFor = useCallback(async () => {
        try {
            // Get contract addresses for nfts owned by ownerAddress
            const contractAddresses = await getContractAddresses(
                selectedAccount?.address!,
            )

            // get nft collection info from GitHub registry
            const collectionInfo = await getCollectionInfo(network.type)

            // Get nftsData for each contract address
            const nftPromises: Promise<NftForContractResponse[]>[] = []
            const resultsPerPage = 5
            for (const contractAddress of contractAddresses) {
                const nfts = getNftsForContract(
                    contractAddress,
                    selectedAccount?.address!,
                    resultsPerPage,
                )
                nftPromises.push(nfts)
            }

            // resolve promisses
            const nftResults = await allSettled(nftPromises)

            const nftData: NftForContractResponse[][] = nftResults.map(
                (result: PromiseSettledResult<NftForContractResponse>) => {
                    if (result.status === "fulfilled") {
                        return result.value
                    }
                },
            )

            const _nftCollections: NonFungibleTokenCollection[] = []

            // loop over the nnft collections
            for (const collection of nftData) {
                // find collection from GH registry
                const foundCollection = collectionInfo.find(
                    col => col.address === collection[0].contractAddress,
                )

                const nftCollection: NonFungibleTokenCollection = {
                    address: "",
                    name: "",
                    symbol: "",
                    creator: "",
                    description: "",
                    icon: "",
                    balanceOf: 0,
                    nfts: [],
                }

                // loop over the nfts in the collection to get nft details
                for (const item of collection) {
                    if (!nftCollection.address)
                        nftCollection.address = item.contractAddress

                    if (!nftCollection.icon)
                        nftCollection.icon = foundCollection?.icon
                            ? `https://vechain.github.io/nft-registry/${foundCollection?.icon}`
                            : ""

                    if (!nftCollection.symbol)
                        nftCollection.symbol = await getSymbol(
                            item.contractAddress,
                            thor,
                        )

                    if (!nftCollection.creator)
                        nftCollection.creator =
                            foundCollection?.creator ?? "N/A"

                    if (!nftCollection.description)
                        nftCollection.description =
                            foundCollection?.description ?? ""

                    if (!nftCollection.name)
                        nftCollection.name = await getName(
                            item.contractAddress,
                            thor,
                        )

                    if (!nftCollection.balanceOf)
                        nftCollection.balanceOf = await getNftBalanceOf(
                            selectedAccount?.address!,
                            item.contractAddress,
                            thor,
                        )

                    const ownerOf = await getOwnerOf(
                        item.tokenId,
                        item.contractAddress,
                        thor,
                    )

                    const tokenURI = await getTokenURI(
                        item.tokenId,
                        item.contractAddress,
                        thor,
                    )

                    const nft = {
                        tokenId: item.tokenId,
                        owner: ownerOf,
                        tokenURI,
                        image: "",
                        belongsToCollectionAddress: item.contractAddress,
                    }

                    nftCollection.nfts.push(nft)
                }

                _nftCollections.push(nftCollection)
            }

            setNftCollections(_nftCollections)
        } catch (e) {
            error(e)
            throw e
        }
    }, [network.type, selectedAccount?.address, thor])

    useEffect(() => {
        getNFTsFor()
    }, [getNFTsFor])

    return {
        nftCollections,
    }
}
