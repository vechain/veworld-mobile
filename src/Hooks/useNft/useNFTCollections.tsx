import { useCallback } from "react"
import { useThor } from "~Components"
import { Network, NonFungibleTokenCollection } from "~Model"
import { GithubCollectionResponse, getContractAddresses } from "~Networking"
import {
    setCollections,
    setNetworkingSideEffects,
    useAppDispatch,
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
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const getCollections = useCallback(
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
                // Get contract addresses for nfts owned by ownerAddress
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        network.type,
                        selectedAccount,
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
                    selectedAccount,
                    nftResultsPerPage,
                )

                const _nftCollections: NonFungibleTokenCollection[] = []

                // loop over the nft collections
                for (const nft of nftData) {
                    // find collection from GH registry
                    const foundCollection = registryInfo.find(
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
        [LL, dispatch, thor],
    )

    return { getCollections }
}
