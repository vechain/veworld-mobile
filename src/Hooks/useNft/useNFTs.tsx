import { useCallback } from "react"
import {
    // selectSelectedAccount,
    setNFTs,
    setNetworkingSideEffects,
    useAppDispatch,
    // useAppSelector,
} from "~Storage/Redux"
import { getNFTdataForContract } from "./Helpers"
import { NonFungibleToken } from "~Model"
import { getTokenURI } from "~Networking"
import { useThor } from "~Components"
import { NFTPlaceholder } from "~Assets"
import { fetchMetadata } from "./fetchMeta"
import { error } from "~Utils"
import { ACCOUNT_WITH_NFTS, NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useI18nContext } from "~i18n"

//  Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const useNFTs = () => {
    const dispatch = useAppDispatch()
    // const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()
    const { LL } = useI18nContext()

    const getNFTsForCollection = useCallback(
        async (
            contractAddress: string,
            _page: number,
            _resultsPerPage: number = NFT_PAGE_SIZE,
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
                    // selectedAccount.address,
                    ACCOUNT_WITH_NFTS,
                    _resultsPerPage,
                    _page,
                )

                const NFTs: NonFungibleToken[] = []

                for (const nfts of nftData) {
                    //
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
                            // selectedAccount.address
                            ACCOUNT_WITH_NFTS

                        _nft = {
                            id,
                            tokenId: nft.tokenId,
                            // owner: selectedAccount.address,
                            owner: ACCOUNT_WITH_NFTS,
                            tokenURI,
                            ...nftMeta?.tokenMetadata,
                            icon: {
                                url: nftMeta?.imageUrl ?? NFTPlaceholder,
                                mime: nftMeta?.imageType ?? "image/png",
                            },
                            image: nftMeta?.imageUrl ?? NFTPlaceholder,
                            belongsToCollectionAddress: contractAddress,
                            isBlacklisted: false,
                            name:
                                nftMeta?.tokenMetadata.name ??
                                LL.COMMON_NOT_AVAILABLE(),
                        }

                        NFTs.push(_nft)
                    }
                }

                dispatch(
                    setNFTs({
                        address: ACCOUNT_WITH_NFTS,
                        // address: selectedAccount.address,
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
        // [dispatch, selectedAccount.address, thor],
        [LL, dispatch, thor],
    )

    return { getNFTsForCollection }
}
