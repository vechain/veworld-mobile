import { useCallback } from "react"
import {
    selectAllFavoriteCollections,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
    toggleFavoriteCollection as toggleFavoriteCollectionAction,
} from "~Storage/Redux"

export const useCollectionsBookmarking = () => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const favoriteCollections = useAppSelector(selectAllFavoriteCollections)

    const toggleFavoriteCollection = useCallback(
        (address: string, collectionId: string) => {
            dispatch(
                toggleFavoriteCollectionAction({
                    address,
                    collectionId,
                    owner: selectedAccount.address,
                    genesisId: selectedNetwork.genesis.id,
                }),
            )
        },
        [dispatch, selectedAccount.address, selectedNetwork.genesis.id],
    )

    return { favoriteCollections, toggleFavoriteCollection }
}
