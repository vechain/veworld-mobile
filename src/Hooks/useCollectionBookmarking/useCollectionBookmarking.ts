import { useCallback, useMemo } from "react"
import { useStore } from "react-redux"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    isCollectionFavorite,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleCollectionFavorite as toggleCollectionFavoriteAction,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"

export const useCollectionBookmarking = (collectionAddress: string) => {
    const dispatch = useAppDispatch()
    const store = useStore()
    const track = useAnalyticTracking()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isFavorite = useAppSelector(state => isCollectionFavorite(state, collectionAddress))

    const toggleFavorite = useCallback(() => {
        const currentIsFavorite = isCollectionFavorite(store.getState() as RootState, collectionAddress)

        dispatch(
            toggleCollectionFavoriteAction({
                address: collectionAddress,
                owner: selectedAccount.address,
                genesisId: selectedNetwork.genesis.id,
            }),
        )

        track(
            currentIsFavorite
                ? AnalyticsEvent.NFT_COLLECTION_FAVORITE_REMOVED
                : AnalyticsEvent.NFT_COLLECTION_FAVORITE_ADDED,
            {
                address: collectionAddress,
                network: selectedNetwork.name,
            },
        )
    }, [store, dispatch, collectionAddress, selectedAccount.address, selectedNetwork, track])

    return useMemo(
        () => ({
            isFavorite,
            toggleFavorite,
        }),
        [isFavorite, toggleFavorite],
    )
}
