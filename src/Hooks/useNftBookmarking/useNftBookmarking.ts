import { useCallback, useMemo } from "react"
import { useStore } from "react-redux"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    isNftFavorite,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleFavorite as toggleFavoriteAction,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"

export const useNftBookmarking = (address: string, tokenId: string) => {
    const dispatch = useAppDispatch()
    const store = useStore()
    const track = useAnalyticTracking()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isFavorite = useAppSelector(state => isNftFavorite(state, address, tokenId))

    const toggleFavorite = useCallback(() => {
        const currentIsFavorite = isNftFavorite(store.getState() as RootState, address, tokenId)

        dispatch(
            toggleFavoriteAction({
                address,
                tokenId,
                owner: selectedAccount.address,
                genesisId: selectedNetwork.genesis.id,
            }),
        )

        track(currentIsFavorite ? AnalyticsEvent.NFT_FAVORITE_REMOVED : AnalyticsEvent.NFT_FAVORITE_ADDED, {
            address,
            tokenId,
            network: selectedNetwork.name,
        })
    }, [store, dispatch, address, tokenId, selectedAccount.address, selectedNetwork, track])

    return useMemo(
        () => ({
            isFavorite,
            toggleFavorite,
        }),
        [isFavorite, toggleFavorite],
    )
}
