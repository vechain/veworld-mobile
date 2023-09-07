import { useCallback } from "react"
import { useThor } from "~Components"
import { NftCollection } from "~Model"
import {
    getContractAddresses,
    getName,
    getNftBalanceOf,
    getNftsForContract,
    getSymbol,
    getTokenTotalSupply,
    getTokenURI,
    GithubCollectionResponse,
} from "~Networking"
import {
    selectNftCollectionsWithoutMetadata,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    setCollections,
    setNetworkingSideEffects,
    updateCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, error, warn } from "~Utils"
import {
    initCollectionMetadataFromRegistry,
    initCollectionMetadataWithoutRegistry,
} from "./Helpers"
import { useI18nContext } from "~i18n"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { useTheme, useTokenMetadata } from "~Hooks"
import { useLazyLoader } from "./useLazyLoader"

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

    const lazyLoadMetadata = useCallback(
        async (collection: NftCollection) => {
            try {
                // Exit if currentAddress.address is not set
                if (!currentAddress) return

                debug(
                    `Lazy loading metadata for collection ${collection.address}`,
                )

                const { data } = await getNftsForContract(
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

                let balanceOf: number | undefined

                try {
                    balanceOf = await getNftBalanceOf(
                        currentAddress,
                        collection.address,
                        thor,
                    )
                } catch (e) {
                    warn(" useNFTCollections - failed to get balanceO", e)
                }

                const tokenMetadata = await fetchMetadata(tokenURI)
                const name =
                    tokenMetadata?.name ??
                    (await getName(collection.address, thor))
                const image = tokenMetadata?.image ?? collection.image

                const description =
                    tokenMetadata?.description ?? collection.description

                const updated: NftCollection = {
                    ...collection,
                    balanceOf: balanceOf,
                    image,
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
            } catch (e) {
                error("Error: useNFTCollections", e)
            }
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
                if (pagination.totalPages && _page >= pagination.totalPages)
                    return

                // Parse collection metadata from registry info or the chain if needed
                const _nftCollections: NftCollection[] = contractsForNFTs.map(
                    collection => {
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
                    },
                )

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
