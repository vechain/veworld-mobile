import { useCallback } from "react"
import { useThor } from "~Components"
import { NonFungibleTokenCollection } from "~Model"
import { getCollectionInfo, getContractAddresses } from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setCollections,
    setNetworkingSideEffects,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error } from "~Common/Logger"
import { getNFTdataForContract, prepareCollectionData } from "./Helpers"
import { useI18nContext } from "~i18n"

/**
 * useNFTCollections
 * @description In order to test this hook, you need to change everywhere "selectedAccount.address" with "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048" in order to get
 * an account with a lot of NFT collections and NFTs
 * @returns
 */

export const useNFTCollections = () => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
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
                        selectedAccount.address,
                        _resultsPerPage,
                        _page,
                    )

                // get nft collection info from GitHub registry
                const collectionRegistryInfo = await getCollectionInfo(
                    network.type,
                )

                // Get nfts for each contract address
                const { nftData } = await getNFTdataForContract(
                    contractsForNFTs,
                    selectedAccount.address,
                    _resultsPerPage,
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
                        LL.DATE_NOT_AVAILABLE(),
                    )

                    _nftCollections.push(nftCollection)
                }

                // set collections to store
                dispatch(
                    setCollections({
                        address: selectedAccount.address,
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
        [LL, dispatch, network.type, selectedAccount.address, thor],
    )

    return { getCollections }
}
