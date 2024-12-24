import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ActionBanner, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const ClaimUsernameBanner = () => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const onClaimPress = useCallback(() => {
        nav.navigate(Routes.CLAIM_USERNAME)
    }, [nav])

    return (
        <BaseView w={100} px={20}>
            <ActionBanner actionText="Claim" actionTestID="claimUsernameBtn" onPress={onClaimPress}>
                <BaseText color={theme.colors.actionBanner.title} typographyFont="captionRegular">
                    {LL.BANNER_TITLE_CLAIM_USERNAME()}
                </BaseText>
            </ActionBanner>
        </BaseView>
    )
}
