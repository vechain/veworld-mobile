import { useCallback, useEffect } from "react"
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import { getCollectionInfo, getContractAddresses } from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectCollectionRegistryInfo,
    setCollectionRegistryInfo,
    setCollections,
    setNetworkingSideEffects,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, error } from "~Utils"
import { getNFTdataForContract, prepareCollectionData } from "./Helpers"
import { useI18nContext } from "~i18n"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"

/**
 * `useNFTCollections` is a React hook that facilitates the fetching and management of NFT collections for a selected account.
 * It fetches the contract addresses for the NFTs owned by the selected account and retrieves additional details about each NFT collection from a registry.
 * The results are stored in a Redux store and can be accessed throughout the application.
 *
 * Note: To test this hook, replace `selectedAccount.address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
 *
 * @returns {object} The object returned contains a `getCollections` function that can be invoked to fetch NFT collections.
 *
 * @example
 * const { getCollections } = useNFTCollections();
 * getCollections(1, 10);  // fetches the first 10 NFT collections
 *
 * @method
 * getCollections(_page: number, _resultsPerPage: number = 10)
 * An async function that fetches the NFT collections for the selected account.
 */

export const useNFTCollections = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const collectionRegistryInfo = useAppSelector(selectCollectionRegistryInfo)
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    // Load the collection registry info from github. Only load once per session or on network change.
    useEffect(() => {
        // get nft collection info from GitHub registry
        getCollectionInfo(network.type).then(cri => {
            debug("Got collection registry info from GitHub")

            // store collection registry info in redux
            dispatch(
                setCollectionRegistryInfo({
                    registryInfo: cri,
                    network: network.type,
                }),
            )
        })
    }, [dispatch, network.type])

    const getCollections = useCallback(
        async (_page: number, _resultsPerPage: number = NFT_PAGE_SIZE) => {
            // exit early if there is no registry info
            if (
                !collectionRegistryInfo ||
                collectionRegistryInfo.registryInfo.length === 0
            )
                return

            dispatch(
                setNetworkingSideEffects({ isLoading: true, error: undefined }),
            )

            try {
                // Get contract addresses for nfts owned by ownerAddress
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        network.type,
                        selectedAccount.address,
                        _resultsPerPage,
                        _page,
                    )

                debug(
                    `Got ${pagination.totalElements} nft contracts from indexer`,
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

                // Get nfts for each contract address
                const nftResultsPerPage = 1
                const { nftData } = await getNFTdataForContract(
                    network,
                    contractsForNFTs,
                    selectedAccount.address,
                    nftResultsPerPage,
                )

                const _nftCollections: NonFungibleTokenCollection[] = []

                // loop over the nft collections
                for (const nft of nftData) {
                    // find collection from GH registry
                    const foundCollection =
                        collectionRegistryInfo.registryInfo.find(
                            col => col.address === nft.data[0].contractAddress,
                        )

                    const { nftCollection } = await prepareCollectionData(
                        nft,
                        foundCollection,
                        thor,
                        LL.COMMON_NOT_AVAILABLE(),
                    )

                    _nftCollections.push(nftCollection)
                }

                // set collections to store
                dispatch(
                    setCollections({
                        currentAccountAddress: selectedAccount.address,
                        collectiondata: {
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
                dispatch(
                    setNetworkingSideEffects({
                        isLoading: false,
                        error: e?.toString() as string,
                    }),
                )
                error("useNFTCollections", e)
            }
        },
        [
            LL,
            dispatch,
            network,
            collectionRegistryInfo,
            selectedAccount.address,
            thor,
        ],
    )

    return { getCollections }
}
