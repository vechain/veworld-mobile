import { useCallback } from "react"
import {
    selectSelectedAccount,
    setNFTs,
    setNetworkingSideEffects,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { getNFTdataForContract } from "./Helpers"
import { NonFungibleToken } from "~Model"
import { getTokenURI } from "~Networking"
import { useThor } from "~Components"
import { NFTPlaceholder } from "~Assets"
import { fetchMetadata } from "./fetchMeta"
import { error } from "~Utils"

export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()

    const getNFTsFotCollection = useCallback(
        async (
            contractAddress: string,
            _page: number,
            _resultsPerPage: number = 10,
        ) => {
            dispatch(
                setNetworkingSideEffects({
                    isLoading: true,
                    error: undefined,
                }),
            )

            try {
                const { nftData } = await getNFTdataForContract(
                    [contractAddress],
                    selectedAccount.address,
                    _resultsPerPage,
                    _page,
                )

                const NFTs: NonFungibleToken[] = []

                for (const nfts of nftData) {
                    for (const nft of nfts.data) {
                        const tokenURI = await getTokenURI(
                            nft.tokenId,
                            contractAddress,
                            thor,
                        )

                        let _nft: NonFungibleToken

                        const nftMeta = await fetchMetadata(tokenURI)

                        const id =
                            contractAddress +
                            nft.tokenId +
                            selectedAccount.address

                        _nft = {
                            id,
                            tokenId: nft.tokenId,
                            owner: selectedAccount.address,
                            tokenURI,
                            ...nftMeta?.tokenMetadata,
                            image: nftMeta?.imageUrl ?? NFTPlaceholder,
                            belongsToCollectionAddress: contractAddress,
                        }

                        NFTs.push(_nft)
                    }
                }

                dispatch(
                    setNFTs({
                        address: selectedAccount.address,
                        collectionAddress: contractAddress,
                        NFTs: NFTs,
                        // taking first element because we are fetching only for one contract address
                        pagination: nftData[0].pagination,
                    }),
                )

                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: undefined,
                    }),
                )
            } catch (e) {
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: e?.toString() as string,
                    }),
                )
                error("useNFTs", e)
            }
        },
        [dispatch, selectedAccount.address, thor],
    )

    return { getNFTsFotCollection }
}
