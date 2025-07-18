import { useCallback } from "react"
import {
    selectAllNftsWithoutMetadata,
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
import { debug, error } from "~Utils"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useI18nContext } from "~i18n"
import { initialiseNFTMetadata } from "./Helpers"
import { useTheme, useNFTMetadata } from "~Hooks"
import { useLazyLoader } from "./useLazyLoader"
import { ERROR_EVENTS } from "~Constants"
import { useThorClient } from "~Hooks/useThorClient"

export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const currentAddress = useAppSelector(selectSelectedAccountAddress)
    const visibleNfts = useAppSelector(selectAllNftsWithoutMetadata)
    const { fetchMetadata } = useNFTMetadata()
    const thor = useThorClient()
    const { LL } = useI18nContext()

    const theme = useTheme()

    const lazyLoadMetadata = useCallback(
        async (nft: NonFungibleToken) => {
            if (!currentAddress) return

            debug(ERROR_EVENTS.NFT, `Lazy loading metadata for NFT ${nft.id}`)

            const tokenURI = nft.tokenURI ?? (await getTokenURI(nft.tokenId, nft.address, thor))
            const tokenMetadata = await fetchMetadata(tokenURI)
            const image = tokenMetadata?.image ?? nft.image

            const updated = {
                ...nft,
                image,
                tokenURI,
                updated: true,
                name: tokenMetadata?.name ?? LL.COMMON_NOT_AVAILABLE(),
                description: tokenMetadata?.description ?? LL.COMMON_NOT_AVAILABLE(),
            }
            dispatch(
                updateNFT({
                    address: currentAddress, // NFT_WHALE - replace here
                    collectionAddress: nft.address,
                    nft: updated,
                }),
            )
        },
        [LL, currentAddress, dispatch, fetchMetadata, thor],
    )

    useLazyLoader({
        payload: visibleNfts,
        loader: lazyLoadMetadata,
    })

    const loadNFTsForCollection = useCallback(
        async (contractAddress: string, _page: number, _resultsPerPage: number = NFT_PAGE_SIZE) => {
            if (!currentAddress) return
            dispatch(
                setNetworkingSideEffects({
                    isLoading: true,
                    error: undefined,
                }),
            )
            let err

            try {
                const nftResponse = await getNftsForContract(
                    network.type,
                    contractAddress,
                    currentAddress, // NFT_WHALE - replace here
                    _resultsPerPage,
                    _page,
                )

                const nfts: NonFungibleToken[] = nftResponse.data.map(nft => {
                    return initialiseNFTMetadata(nft.tokenId, nft.contractAddress, nft.owner, theme.isDark)
                })

                dispatch(
                    setNFTs({
                        address: currentAddress, // NFT_WHALE - replace here
                        collectionAddress: contractAddress,
                        nfts: nfts,
                        // taking first element because we are fetching only for one contract address
                        pagination: nftResponse.pagination,
                    }),
                )
            } catch (e) {
                err = e?.toString() as string
                error(ERROR_EVENTS.NFT, e)
            } finally {
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: err,
                    }),
                )
            }
        },
        [dispatch, network.type, currentAddress, theme.isDark],
    )

    return { loadNFTsForCollection }
}
