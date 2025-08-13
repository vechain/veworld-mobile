import React, { useEffect } from "react"
import { BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectSuggestedAppIds, setSuggestedAppIds, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { VbdCarousel } from "../Common/VbdCarousel/VbdCarousel"

const SUGGESTED_APP_IDS = [
    //Mugshot
    "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
    //Cleanify
    "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
    //Greencart
    "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
    //EVearn
    "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
]

export const NewUserForYouCarousel = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const appIds = useAppSelector(selectSuggestedAppIds)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (appIds?.length === SUGGESTED_APP_IDS.length) return

        const shuffled = SUGGESTED_APP_IDS.slice(0, -1)
            .sort(() => (Math.random() < 0.5 ? -1 : 1))
            .concat([SUGGESTED_APP_IDS[SUGGESTED_APP_IDS.length - 1]])
        dispatch(setSuggestedAppIds(shuffled))
    }, [appIds?.length, dispatch])

    return (
        <BaseView flexDirection="column" gap={16}>
            <BaseText
                typographyFont="subSubTitleSemiBold"
                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
                px={16}>
                {LL.DISCOVER_SUGGESTED_FOR_YOU()}
            </BaseText>
            <VbdCarousel appIds={appIds ?? []} isLoading={!appIds} />
        </BaseView>
    )
}
