import { useCallback, useEffect, useRef, useState } from "react"
import {
    selectAllVisibleNFTs,
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
import { fetchMetadata } from "./fetchMeta"

const MAX_RETRIES = 10

//  Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const useNFTs = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const currentAddress = useAppSelector(selectSelectedAccountAddress)
    const nfts = useAppSelector(selectAllVisibleNFTs)
    const thor = useThor()
    const { LL } = useI18nContext()
    const [triggerRefresh, setTriggerRefresh] = useState(0)
    const metadataLoading = useRef(
        new Map<string, { isLoading: boolean; count: number }>(),
    )

    const theme = useTheme()

    const lazyLoadMetadata = useCallback(
        async (networkType: string, address: string, nft: NonFungibleToken) => {
            const loadingStatus = metadataLoading.current.get(nft.id)
            if (
                loadingStatus &&
                (loadingStatus.isLoading || loadingStatus.count > MAX_RETRIES)
            )
                return

            const newStatus = {
                isLoading: true,
                count: (loadingStatus?.count ?? 0) + 1,
            }

            try {
                debug(`Lazy loading metadata for NFT ${nft.id}`)
                metadataLoading.current.set(nft.id, newStatus)

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
                    name: tokenMetadata?.name ?? nft.name,
                    description: tokenMetadata?.description ?? nft.description,
                }
                dispatch(
                    updateNFT({
                        address,
                        collectionAddress: nft.address,
                        NFT: updated,
                    }),
                )
                metadataLoading.current.set(nft.id, {
                    isLoading: false,
                    count: 0,
                })
            } catch (e: unknown) {
                metadataLoading.current.set(nft.id, {
                    isLoading: false,
                    count: newStatus.count,
                })
                error("lazyLoadMetadata for NFT", e)
            }
        },
        [dispatch, thor],
    )

    // Trigger lazy loading of metadata
    useEffect(() => {
        if (!currentAddress) return

        // Try to get metadata for collections that don't have it
        nfts.forEach(nft => {
            if (
                MediaUtils.isDefaultImage(nft.image) &&
                !metadataLoading.current.get(nft.id)
            )
                lazyLoadMetadata(network.type, currentAddress, nft)
        })
    }, [
        currentAddress,
        dispatch,
        lazyLoadMetadata,
        network.type,
        nfts,
        triggerRefresh,
        thor,
    ])

    // Trigger a metadata refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTriggerRefresh(Date.now())
        }, 30000)
        return () => clearInterval(interval)
    }, [])

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
