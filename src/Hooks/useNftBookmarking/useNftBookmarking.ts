import { useCallback, useMemo } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "../useAnalyticTracking"
import {
    isNftFavorite,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleFavorite as toggleFavoriteAction,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { Feedback } from "~Components/Providers/FeedbackProvider"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

export const useNftBookmarking = (address: string, tokenId: string) => {
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const isFavorite = useAppSelector(state => isNftFavorite(state, address, tokenId))
    const { LL } = useI18nContext()

    const toggleFavorite = useCallback(() => {
        dispatch(
            toggleFavoriteAction({
                address,
                tokenId,
                owner: selectedAccount.address,
                genesisId: selectedNetwork.genesis.id,
            }),
        )

        if (!isFavorite) {
            Feedback.show({
                severity: FeedbackSeverity.INFO,
                type: FeedbackType.ALERT,
                message: LL.FEEDBACK_FAVORITED(),
                icon: "icon-star",
            })
        }

        track(isFavorite ? AnalyticsEvent.NFT_FAVORITE_REMOVED : AnalyticsEvent.NFT_FAVORITE_ADDED, {
            address,
            tokenId,
            network: selectedNetwork.name,
        })
    }, [
        dispatch,
        address,
        tokenId,
        selectedAccount.address,
        selectedNetwork.genesis.id,
        selectedNetwork.name,
        isFavorite,
        track,
        LL,
    ])

    return useMemo(
        () => ({
            isFavorite,
            toggleFavorite,
        }),
        [isFavorite, toggleFavorite],
    )
}
