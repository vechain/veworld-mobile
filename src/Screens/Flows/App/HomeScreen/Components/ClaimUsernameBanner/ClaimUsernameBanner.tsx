import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ActionBanner, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"

export const ClaimUsernameBanner = () => {
    const theme = useTheme()
    const nav = useNavigation()

    const onClaimPress = useCallback(() => {
        nav.navigate(Routes.CLAIM_USERNAME)
    }, [nav])

    return (
        <BaseView w={100} px={20}>
            <ActionBanner actionText="Claim" actionTestID="claimUsernameBtn" onPress={onClaimPress}>
                <BaseText color={theme.colors.text}>{"Claim your username"}</BaseText>
            </ActionBanner>
        </BaseView>
    )
}
