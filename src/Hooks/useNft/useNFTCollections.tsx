import { useCallback } from "react"
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import { getCollectionInfo, getContractAddresses } from "~Networking"
import {
    // selectSelectedAccount,
    selectSelectedNetwork,
    setCollections,
    setNetworkingSideEffects,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error } from "~Utils"
import { getNFTdataForContract, prepareCollectionData } from "./Helpers"
import { useI18nContext } from "~i18n"
import { ACCOUNT_WITH_NFTS } from "~Constants/Constants/NFT"

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
 *
 * @param {number} _page - The page number for pagination purposes.
 * @param {number} _resultsPerPage - The number of results to fetch per page. Default value is `10`.
 */
export const useNFTCollections = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    // const selectedAccount = useAppSelector(selectSelectedAccount)
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const getCollections = useCallback(
        async (_page: number, _resultsPerPage: number = 10) => {
            dispatch(
                setNetworkingSideEffects({ isLoading: true, error: undefined }),
            )

            try {
                // Get contract addresses for nfts owned by ownerAddress
                const { data: contractsForNFTs, pagination } =
                    await getContractAddresses(
                        // selectedAccount.address,
                        ACCOUNT_WITH_NFTS,
                        _resultsPerPage,
                        _page,
                    )

                // get nft collection info from GitHub registry
                const collectionRegistryInfo = await getCollectionInfo(
                    network.type,
                )

                // Get nfts for each contract address
                const nftResultsPerPage = 1
                const { nftData } = await getNFTdataForContract(
                    contractsForNFTs,
                    // selectedAccount.address,
                    ACCOUNT_WITH_NFTS,
                    nftResultsPerPage,
                )

                const _nftCollections: NonFungibleTokenCollection[] = []

                // loop over the nnft collections
                for (const nft of nftData) {
                    // find collection from GH registry
                    const foundCollection = collectionRegistryInfo.find(
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
                        address: ACCOUNT_WITH_NFTS,
                        // address: selectedAccount.address,
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
        // [LL, dispatch, network.type, selectedAccount.address, thor],
        [LL, dispatch, network.type, thor],
    )

    return { getCollections }
}
