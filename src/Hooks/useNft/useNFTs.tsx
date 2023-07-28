import { useCallback } from "react"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setNFTs,
    setNetworkingSideEffects,
    updateNFT,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { NonFungibleToken } from "~Model"
import { getNftsForContract, getTokenURI } from "~Networking"
import { useThor } from "~Components"
import { MediaUtils, URIUtils, error } from "~Utils"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useI18nContext } from "~i18n"
import { initialiseNFTMetadata } from "./Helpers"
import { useTheme } from "~Hooks"
import { fetchMetadata } from "./fetchMeta"

//  Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()
    const { LL } = useI18nContext()

    const theme = useTheme()

    const lazyLoadMetadata = useCallback(
        async (
            networkType: string,
            address: string,
            collectionAddress: string,
            NFTs: NonFungibleToken[],
        ) => {
            await Promise.all(
                NFTs.map(async nft => {
                    if (MediaUtils.isDefaultImage(nft.image)) {
                        const tokenURI =
                            nft.tokenURI ??
                            (await getTokenURI(nft.tokenId, nft.address, thor))

                        const tokenMetadata = await fetchMetadata(tokenURI)
                        const image = URIUtils.convertUriToUrl(
                            tokenMetadata?.image ?? nft.image,
                        )
                        const mediaType = await MediaUtils.resolveMediaType(
                            image,
                            nft.mimeType,
                        )

                        if (tokenMetadata) {
                            const updated = {
                                ...nft,
                                image,
                                mediaType,
                                name: tokenMetadata?.name ?? nft.name,
                                description:
                                    tokenMetadata?.description ??
                                    nft.description,
                            }
                            dispatch(
                                updateNFT({
                                    address,
                                    collectionAddress,
                                    NFT: updated,
                                }),
                            )
                        }
                    }
                }),
            )
        },
        [dispatch, thor],
    )

    const loadNFTsForCollection = useCallback(
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
                        return initialiseNFTMetadata(
                            nft.tokenId,
                            nft.contractAddress,
                            nft.owner,
                            thor,
                            LL.COMMON_NOT_AVAILABLE(),
                            theme.isDark,
                        )
                    }),
                )

                dispatch(
                    setNFTs({
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

                lazyLoadMetadata(
                    network.type,
                    selectedAccount.address,
                    contractAddress,
                    NFTs,
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
            lazyLoadMetadata,
            thor,
            LL,
            theme.isDark,
        ],
    )

    return { loadNFTsForCollection }
}
