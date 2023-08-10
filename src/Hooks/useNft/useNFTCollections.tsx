import { useCallback, useEffect } from "react"
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import {
    GithubCollectionResponse,
    getContractAddresses,
    getName,
    getNftsForContract,
    getSymbol,
    getTokenTotalSupply,
    getTokenURI,
} from "~Networking"
import {
    clearNFTCache,
    selectNftCollectionsWithoutMetadata,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    setCollections,
    setNetworkingSideEffects,
    updateCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { MediaUtils, URIUtils, debug, error } from "~Utils"
import {
    initCollectionMetadataFromRegistry,
    initCollectionMetadataWithoutRegistry,
} from "./Helpers"
import { useI18nContext } from "~i18n"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { useTheme } from "~Hooks"
import { useLazyLoader } from "./useLazyLoader"
import { useTokenMetadata } from "~Hooks/useTokenMetadata"

/**
 * `useNFTCollections` is a React hook that facilitates the fetching and management of NFT collections for a selected account.
 * It fetches the contract addresses for the NFTs owned by the selected account and retrieves additional details about each NFT collection from a registry.
 * The results are stored in a Redux store and can be accessed throughout the application.
 *
 * Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
 *
 * @returns {object} The object returned contains a `loadCollections` function that can be invoked to fetch NFT collections.
 *
 * @example
 * const { loadCollections } = useNFTCollections();
 * loadCollections(1, 10);  // fetches the first 10 NFT collections
 *
 * @method
 * loadCollections(_page: number, _resultsPerPage: number = 10)
 * An async function that fetches the NFT collections for the selected account.
 */

export const useNFTCollections = () => {
    const thor = useThor()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const currentAddress = useAppSelector(selectSelectedAccountAddress)
    const nftCollections = useAppSelector(selectNftCollectionsWithoutMetadata)
    const { fetchMetadata } = useTokenMetadata()

    const theme = useTheme()

    // Clear caches on network change
    useEffect(() => {
        dispatch(clearNFTCache())
    }, [dispatch, network])

    const lazyLoadMetadata = useCallback(
        async (collection: NonFungibleTokenCollection) => {
            // Exit if currentAddress.address is not set
            if (!currentAddress) return

            debug(`Lazy loading metadata for collection ${collection.address}`)

            const { data, pagination } = await getNftsForContract(
                network.type,
                collection.address,
                currentAddress,
                1,
                0,
            )
            if (data.length === 0) return

            const tokenURI = await getTokenURI(
                data[0].tokenId,
                collection.address,
                thor,
            )

            const tokenMetadata = await fetchMetadata(tokenURI)
            const name =
                tokenMetadata?.name ?? (await getName(collection.address, thor))
            const image = URIUtils.convertUriToUrl(
                tokenMetadata?.image ?? collection.image,
            )
            const mediaType = await MediaUtils.resolveMediaType(
                image,
                collection.mimeType,
            )
            const description =
                tokenMetadata?.description ?? collection.description

            const updated = {
                ...collection,
                balanceOf: pagination.totalElements,
                hasCount: pagination.hasCount,
                image,
                mediaType,
                name,
                description,
                updated: true,
                symbol: await getSymbol(collection.address, thor),
                totalSupply: await getTokenTotalSupply(
                    collection.address,
                    thor,
                ),
            }

            dispatch(
                updateCollection({
                    currentAccountAddress: currentAddress,
                    collection: updated,
                }),
            )
        },
        [currentAddress, dispatch, fetchMetadata, network.type, thor],
    )

    useLazyLoader({
        payload: nftCollections,
        loader: lazyLoadMetadata,
    })

    const loadCollections = useCallback(
        async (
            registryInfo: GithubCollectionResponse[],
            _page: number,
            _resultsPerPage: number = NFT_PAGE_SIZE,
        ) => {
            if (!currentAddress) return
            dispatch(
                setNetworkingSideEffects({ isLoading: true, error: undefined }),
            )
            let err

            try {
                // Get contract addresses for nfts owned by selected account
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        network.type,
                        currentAddress,
                        _resultsPerPage,
                        _page,
                    )

                // exit early if there are no more pages to fetch
                if (_page >= pagination.totalPages) return

                // Parse collection metadata from registry info or the chain if needed
                const _nftCollections: NonFungibleTokenCollection[] =
                    contractsForNFTs.map(collection => {
                        const regInfo = registryInfo.find(col =>
                            compareAddresses(col.address, collection),
                        )
                        if (regInfo) {
                            return initCollectionMetadataFromRegistry(
                                network.type,
                                currentAddress,
                                collection,
                                regInfo,
                            )
                        } else {
                            return initCollectionMetadataWithoutRegistry(
                                network.type,
                                currentAddress,
                                collection,
                                LL.COMMON_NOT_AVAILABLE(),
                                theme.isDark,
                            )
                        }
                    })

                // set collections to store
                dispatch(
                    setCollections({
                        currentAccountAddress: currentAddress,
                        collectionData: {
                            collections: _nftCollections,
                            pagination,
                        },
                    }),
                )

                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: undefined,
                    }),
                )
            } catch (e: unknown) {
                err = e?.toString() as string
                error("useNFTCollections", e)
            } finally {
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: err,
                    }),
                )
            }
        },
        [LL, dispatch, currentAddress, network.type, theme.isDark],
    )

    return { loadCollections }
}
