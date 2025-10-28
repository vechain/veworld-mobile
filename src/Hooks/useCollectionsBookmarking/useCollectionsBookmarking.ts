import { useCallback, useMemo } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
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
    const track = useAnalyticTracking()
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

        track(
            isFavorite ? AnalyticsEvent.NFT_COLLECTION_FAVORITE_REMOVED : AnalyticsEvent.NFT_COLLECTION_FAVORITE_ADDED,
            {
                address,
                network: selectedNetwork.name,
            },
        )
    }, [dispatch, address, selectedAccount.address, selectedNetwork, track, isFavorite])

    return useMemo(() => ({ isFavorite, toggleFavoriteCollection }), [isFavorite, toggleFavoriteCollection])
}
