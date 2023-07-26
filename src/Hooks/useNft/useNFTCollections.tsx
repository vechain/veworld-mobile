import { useCallback } from "react"
import { useThor } from "~Components"
import { NETWORK_TYPE, Network, NonFungibleTokenCollection } from "~Model"
import {
    GithubCollectionResponse,
    getContractAddresses,
    getNftsForContract,
    getTokenURI,
} from "~Networking"
import {
    setCollections,
    setNetworkingSideEffects,
    updateCollection,
    useAppDispatch,
} from "~Storage/Redux"
import { MediaUtils, URIUtils, error } from "~Utils"
import {
    parseCollectionMetadataFromRegistry,
    parseCollectionMetadataWithoutRegistry,
} from "./Helpers"
import { useI18nContext } from "~i18n"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { useTheme } from "~Hooks"
import { fetchMetadata } from "./fetchMeta"

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

    const theme = useTheme()

    const lazyLoadMetadata = useCallback(
        async (
            networkType: NETWORK_TYPE,
            address: string,
            _nftCollections: NonFungibleTokenCollection[],
        ) => {
            await Promise.all(
                _nftCollections.map(async collection => {
                    if (MediaUtils.isDefaultImage(collection.image)) {
                        const { data } = await getNftsForContract(
                            networkType,
                            collection.address,
                            address,
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
                        const image = URIUtils.convertUriToUrl(
                            tokenMetadata?.image ?? collection.image,
                        )
                        const mediaType = await MediaUtils.resolveMediaType(
                            image,
                            collection.mimeType,
                        )

                        if (tokenMetadata) {
                            const updated = {
                                ...collection,
                                image,
                                mediaType,
                                name: tokenMetadata?.name ?? collection.name,
                                description:
                                    tokenMetadata?.description ??
                                    collection.description,
                            }
                            dispatch(
                                updateCollection({
                                    network: networkType,
                                    currentAccountAddress: address,
                                    collection: updated,
                                }),
                            )
                        }
                    }
                }),
            )
        },
        [dispatch, thor],
    )

    const loadCollections = useCallback(
        async (
            selectedAccount: string,
            network: Network,
            registryInfo: GithubCollectionResponse[],
            _page: number,
            _resultsPerPage: number = NFT_PAGE_SIZE,
        ) => {
            dispatch(
                setNetworkingSideEffects({ isLoading: true, error: undefined }),
            )

            try {
                // Get contract addresses for nfts owned by selected account
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        network.type,
                        selectedAccount,
                        _resultsPerPage,
                        _page,
                    )

                // exit early if there are no more pages to fetch
                if (_page >= pagination.totalPages) {
                    dispatch(
                        setNetworkingSideEffects({
                            isLoading: false,
                            error: undefined,
                        }),
                    )
                    return
                }

                // Parse collection metadata from registry info or the chain if needed
                const _nftCollections: NonFungibleTokenCollection[] =
                    await Promise.all(
                        contractsForNFTs.map(async collection => {
                            const regInfo = registryInfo.find(col =>
                                compareAddresses(col.address, collection),
                            )
                            if (regInfo) {
                                return parseCollectionMetadataFromRegistry(
                                    network.type,
                                    selectedAccount,
                                    collection,
                                    regInfo,
                                    thor,
                                )
                            } else {
                                return parseCollectionMetadataWithoutRegistry(
                                    network.type,
                                    selectedAccount,
                                    collection,
                                    thor,
                                    LL.COMMON_NOT_AVAILABLE(),
                                    theme.isDark,
                                )
                            }
                        }),
                    )

                // set collections to store
                dispatch(
                    setCollections({
                        network: network.type,
                        currentAccountAddress: selectedAccount,
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

                lazyLoadMetadata(network.type, selectedAccount, _nftCollections)
            } catch (e: unknown) {
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: e?.toString() as string,
                    }),
                )
                error("useNFTCollections", e)
            }
        },
        [LL, dispatch, lazyLoadMetadata, theme.isDark, thor],
    )

    return { loadCollections }
}
