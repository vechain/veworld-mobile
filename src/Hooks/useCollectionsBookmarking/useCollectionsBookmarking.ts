import { useCallback, useMemo } from "react"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
    toggleFavoriteCollection as toggleFavoriteCollectionAction,
    isCollectionFavorite,
} from "~Storage/Redux"

export const useCollectionsBookmarking = (address: string) => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const isFavorite = useAppSelector(state => isCollectionFavorite(state, address))

    const toggleFavoriteCollection = useCallback(() => {
        dispatch(
            toggleFavoriteCollectionAction({
                address,
                owner: selectedAccount.address,
                genesisId: selectedNetwork.genesis.id,
            }),
        )
    }, [dispatch, address, selectedAccount.address, selectedNetwork.genesis.id])

    return useMemo(() => ({ isFavorite, toggleFavoriteCollection }), [isFavorite, toggleFavoriteCollection])
}
