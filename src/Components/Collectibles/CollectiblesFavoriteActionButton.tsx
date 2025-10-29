import React, { useCallback, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import {
    isNftFavorite,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleFavorite,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { CollectiblesActionButton } from "./CollectiblesActionButton"
import HapticsService from "~Services/HapticsService"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { Feedback } from "~Components/Providers/FeedbackProvider"

type Props = {
    address: string
    tokenId: string
}
export const CollectiblesFavoriteActionButton = ({ address, tokenId }: Props) => {
    const { LL } = useI18nContext()
    const isFavorite = useAppSelector(state => isNftFavorite(state, address, tokenId))
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)

    const dispatch = useAppDispatch()

    const icon = useMemo<IconKey>(() => {
        if (isFavorite) return "icon-star-on"
        return "icon-star"
    }, [isFavorite])

    const onPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        if (!isFavorite) {
            Feedback.show({
                severity: FeedbackSeverity.INFO,
                type: FeedbackType.ALERT,
                message: LL.FEEDBACK_FAVORITED(),
                icon: "icon-star",
            })
        }
        dispatch(toggleFavorite({ address, tokenId, owner: account.address, genesisId: network.genesis.id }))
    }, [account.address, address, dispatch, network.genesis.id, tokenId, isFavorite, LL])

    return (
        <CollectiblesActionButton
            active={isFavorite}
            icon={icon}
            onPress={onPress}
            label={LL.COLLECTIBLES_ACTION_FAVORITE_INACTIVE()}
            testID="COLLECTIBLES_ACTION_FAVORITE"
        />
    )
}
