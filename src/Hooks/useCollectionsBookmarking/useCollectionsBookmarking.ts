import { useCallback, useMemo } from "react"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
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
    const { LL } = useI18nContext()

    const toggleFavoriteCollection = useCallback(() => {
        dispatch(
            toggleFavoriteCollectionAction({
                address,
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

        track(
            isFavorite ? AnalyticsEvent.NFT_COLLECTION_FAVORITE_REMOVED : AnalyticsEvent.NFT_COLLECTION_FAVORITE_ADDED,
            {
                address,
                network: selectedNetwork.name,
            },
        )
    }, [
        dispatch,
        address,
        selectedAccount.address,
        selectedNetwork.genesis.id,
        selectedNetwork.name,
        isFavorite,
        track,
        LL,
    ])

    return useMemo(() => ({ isFavorite, toggleFavoriteCollection }), [isFavorite, toggleFavoriteCollection])
}
