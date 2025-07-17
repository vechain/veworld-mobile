import { useCallback } from "react"
import { NftCollection } from "~Model"
import {
    getContractAddresses,
    getNftBalanceOf,
    getNftsForContract,
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

import { isEmpty } from "lodash"
import { ERROR_EVENTS } from "~Constants"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useNFTMetadata } from "~Hooks"
import { useThorClient } from "~Hooks/useThorClient"
import { useI18nContext } from "~i18n"
import { getNftCollectionMetadata } from "~Networking/NFT/getNftCollectionMetadata"
import { debug, warn } from "~Utils"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { initCollectionMetadataFromRegistry, initCollectionMetadataWithoutRegistry } from "./Helpers"
import { useLazyLoader } from "./useLazyLoader"

/**
 * `useNFTCollections` is a React hook that facilitates the fetching and management of NFT collections for a selected account.
 * It fetches the contract addresses for the NFTs owned by the selected account and retrieves additional details about each NFT collection from a registry.
 * The results are stored in a Redux store and can be accessed throughout the application.
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
    const thor = useThorClient()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const currentAddress = useAppSelector(selectSelectedAccountAddress)
    const nftCollections = useAppSelector(selectNftCollectionsWithoutMetadata)
    const { fetchMetadata } = useNFTMetadata()

    const lazyLoadMetadata = useCallback(
        async (collection: NftCollection) => {
            try {
                // Exit if currentAddress.address is not set
                if (!currentAddress) return

                debug(ERROR_EVENTS.NFT, `Lazy loading metadata for collection ${collection.address}`)

                let balanceOf: number | undefined

                try {
                    // NFT_WHALE - replace here
                    balanceOf = await getNftBalanceOf(currentAddress, collection.address, thor)
                } catch (e) {
                    warn(ERROR_EVENTS.NFT, "failed to get balance", e)
                }

                let image = collection.image
                let description = collection.description
                if (!collection.fromRegistry) {
                    // NFT_WHALE - replace here
                    const { data } = await getNftsForContract(network.type, collection.address, currentAddress, 1, 0)
                    const tokenURI = await getTokenURI(data[0].tokenId, collection.address, thor)
                    const tokenMetadata = await fetchMetadata(tokenURI)

                    if (tokenMetadata) {
                        image = tokenMetadata.image
                        description = tokenMetadata.description
                    }
                }

                const { name, symbol, totalSupply } = await getNftCollectionMetadata(collection.address, thor)

                const updated: NftCollection = {
                    ...collection,
                    balanceOf: balanceOf,
                    image,
                    name,
                    description,
                    updated: true,
                    symbol,
                    totalSupply: Number(totalSupply),
                }
                dispatch(
                    updateCollection({
                        currentAccountAddress: currentAddress, // NFT_WHALE - replace here
                        collection: updated,
                    }),
                )
            } catch (e) {
                warn(ERROR_EVENTS.NFT, e)
            }
        },
        [currentAddress, dispatch, fetchMetadata, network.type, thor],
    )

    useLazyLoader({
        payload: nftCollections,
        loader: lazyLoadMetadata,
    })

    const loadCollections = useCallback(
        async (registryInfo: GithubCollectionResponse[], _page: number, _resultsPerPage: number = NFT_PAGE_SIZE) => {
            if (!currentAddress) return
            dispatch(setNetworkingSideEffects({ isLoading: true, error: undefined }))
            let err

            try {
                // Get contract addresses for nfts owned by selected account
                const { data: contractsForNFTs, pagination } = await getContractAddresses(
                    network.type,
                    currentAddress, // NFT_WHALE - replace here
                    _resultsPerPage,
                    _page,
                )

                // exit early if there are no more pages to fetch
                if (isEmpty(contractsForNFTs) && !pagination.hasNext) return

                // Parse collection metadata from registry info or the chain if needed
                const _nftCollections: NftCollection[] = contractsForNFTs.map(collection => {
                    const regInfo = registryInfo.find(col => compareAddresses(col.address, collection))
                    if (regInfo) {
                        // NFT_WHALE - replace here
                        return initCollectionMetadataFromRegistry(network.type, currentAddress, collection, regInfo)
                    } else {
                        return initCollectionMetadataWithoutRegistry(
                            network.type,
                            currentAddress, // NFT_WHALE - replace here
                            collection,
                            LL.COMMON_NOT_AVAILABLE(),
                        )
                    }
                })

                // set collections to store
                dispatch(
                    setCollections({
                        currentAccountAddress: currentAddress, // NFT_WHALE - replace here
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
                warn(ERROR_EVENTS.NFT, e)
            } finally {
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: err,
                    }),
                )
            }
        },
        [LL, dispatch, currentAddress, network.type],
    )

    return { loadCollections }
}
