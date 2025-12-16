import React, { useCallback, useMemo } from "react"
import { useNftBookmarking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import HapticsService from "~Services/HapticsService"
import { CollectiblesActionButton } from "./CollectiblesActionButton"

type Props = {
    address: string
    tokenId: string
}
export const CollectiblesFavoriteActionButton = ({ address, tokenId }: Props) => {
    const { LL } = useI18nContext()
    const { isFavorite, toggleFavorite } = useNftBookmarking(address, tokenId)

    const icon = useMemo<IconKey>(() => {
        if (isFavorite) return "icon-star-on"
        return "icon-star"
    }, [isFavorite])

    const onPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleFavorite()
    }, [toggleFavorite])

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
