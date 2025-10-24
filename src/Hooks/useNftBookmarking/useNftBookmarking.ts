import { useCallback, useMemo } from "react"
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

export const useNftBookmarking = (address: string, tokenId: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isFavorite = useAppSelector(state => isNftFavorite(state, address, tokenId))

    const toggleFavorite = useCallback(() => {
        dispatch(
            toggleFavoriteAction({
                address,
                tokenId,
                owner: selectedAccount.address,
                genesisId: selectedNetwork.genesis.id,
            }),
        )

        track(isFavorite ? AnalyticsEvent.NFT_FAVORITE_REMOVED : AnalyticsEvent.NFT_FAVORITE_ADDED, {
            address,
            tokenId,
            network: selectedNetwork.name,
        })
    }, [dispatch, address, tokenId, selectedAccount.address, selectedNetwork, track, isFavorite])

    return useMemo(
        () => ({
            isFavorite,
            toggleFavorite,
        }),
        [isFavorite, toggleFavorite],
    )
}
