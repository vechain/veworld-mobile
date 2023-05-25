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
    GithubCollectionResponse,
} from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
const allSettled = require("promise.allsettled")

const processCollection = async (
    collectionInfo: GithubCollectionResponse[],
    collection: NftForContractResponse[],
    thor: Connex.Thor,
    accAddress: string,
): Promise<NonFungibleTokenCollection> => {
    {
        // find collection from GH registry
        const foundCollection = collectionInfo.find(
            col => col.address === collection[0].contractAddress,
        )

        if (!foundCollection) throw Error("Collection not found")

        const {
            address: contractAddress,
            creator,
            description,
            icon,
        } = foundCollection

        const nftCollection: NonFungibleTokenCollection = {
            address: contractAddress,
            name: await getName(contractAddress, thor),
            symbol: await getSymbol(contractAddress, thor),
            creator: creator ?? "N/A",
            description: description,
            icon: icon
                ? `https://vechain.github.io/nft-registry/${foundCollection?.icon}`
                : "",
            balanceOf: await getNftBalanceOf(
                accAddress,
                foundCollection.address,
                thor,
            ),
            nfts: [],
        }

        await Promise.all(
            collection.map(async item => {
                //TODO: Do we need owner of if we're getting tokens from indexer?
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
                }

                nftCollection.nfts.push(nft)
            }),
        )

        return nftCollection
    }
}

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
            for (const contractAddress of contractAddresses) {
                const nfts = getNftsForContract(
                    contractAddress,
                    selectedAccount?.address!,
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

            const _nftCollections2: NonFungibleTokenCollection[] =
                await Promise.all(
                    nftData.map(async collection => {
                        return await processCollection(
                            collectionInfo,
                            collection,
                            thor,
                            selectedAccount.address,
                        )
                    }),
                )

            setNftCollections(_nftCollections2)
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
