import { useCallback } from "react"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setNFTs,
    setNetworkingSideEffects,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { NonFungibleToken } from "~Model"
import { getNftsForContract } from "~Networking"
import { useThor } from "~Components"
import { error } from "~Utils"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useI18nContext } from "~i18n"
import { parseNftMetadata } from "./Helpers"
import { useTheme } from "~Hooks"

//  Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()
    const { LL } = useI18nContext()

    const theme = useTheme()

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
                const nftResponse = await getNftsForContract(
                    network.type,
                    contractAddress,
                    selectedAccount.address,
                    _resultsPerPage,
                    _page,
                )

                const NFTs: NonFungibleToken[] = await Promise.all(
                    nftResponse.data.map(async nft => {
                        return parseNftMetadata(
                            network.type,
                            nft,
                            thor,
                            LL.COMMON_NOT_AVAILABLE(),
                            theme.isDark,
                        )
                    }),
                )

                dispatch(
                    setNFTs({
                        network: network.type,
                        address: selectedAccount.address,
                        collectionAddress: contractAddress,
                        NFTs: NFTs,
                        // taking first element because we are fetching only for one contract address
                        pagination: nftResponse.pagination,
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
        [
            dispatch,
            network.type,
            selectedAccount.address,
            thor,
            LL,
            theme.isDark,
        ],
    )

    return { getNFTsForCollection }
}
