import { useCallback } from "react"
import {
    selectAllVisibleNFTsWithoutMetadata,
    selectSelectedAccountAddress,
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
import { MediaUtils, URIUtils, debug, error } from "~Utils"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useI18nContext } from "~i18n"
import { initialiseNFTMetadata } from "./Helpers"
import { useTheme } from "~Hooks"
import { useLazyLoader } from "./useLazyLoader"
import { useTokenMetadata } from "~Hooks/useTokenMetadata"

//  Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const currentAddress = useAppSelector(selectSelectedAccountAddress)
    const nfts = useAppSelector(selectAllVisibleNFTsWithoutMetadata)
    const { fetchMetadata } = useTokenMetadata()
    const thor = useThor()
    const { LL } = useI18nContext()

    const theme = useTheme()

    const lazyLoadMetadata = useCallback(
        async (nft: NonFungibleToken) => {
            if (!currentAddress) return

            debug(`Lazy loading metadata for NFT ${nft.id}`)

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

            const updated = {
                ...nft,
                image,
                mediaType,
                tokenURI,
                updated: true,
                name: tokenMetadata?.name ?? nft.name,
                description: tokenMetadata?.description ?? nft.description,
            }
            dispatch(
                updateNFT({
                    address: currentAddress,
                    collectionAddress: nft.address,
                    nft: updated,
                }),
            )
        },
        [currentAddress, dispatch, fetchMetadata, thor],
    )

    useLazyLoader({
        payload: nfts,
        loader: lazyLoadMetadata,
    })

    const loadNFTsForCollection = useCallback(
        async (
            contractAddress: string,
            _page: number,
            _resultsPerPage: number = NFT_PAGE_SIZE,
        ) => {
            if (!currentAddress) return
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
                    currentAddress,
                    _resultsPerPage,
                    _page,
                )

                const NFTs: NonFungibleToken[] = nftResponse.data.map(nft => {
                    return initialiseNFTMetadata(
                        nft.tokenId,
                        nft.contractAddress,
                        nft.owner,
                        LL.COMMON_NOT_AVAILABLE(),
                        theme.isDark,
                    )
                })

                dispatch(
                    setNFTs({
                        address: currentAddress,
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
        [dispatch, network.type, currentAddress, LL, theme.isDark],
    )

    return { loadNFTsForCollection }
}
