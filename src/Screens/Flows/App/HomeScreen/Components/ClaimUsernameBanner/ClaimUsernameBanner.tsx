import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ActionBanner, BaseText, BaseView } from "~Components"
import { useTheme, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const ClaimUsernameBanner = () => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const isObservedAccount = "type" in selectedAccount && selectedAccount.type === DEVICE_TYPE.LOCAL_WATCHED

    const { name } = useVns({
        address: selectedAccount.address,
        name: "",
    })

    const onClaimPress = useCallback(() => {
        nav.navigate(Routes.CLAIM_USERNAME)
    }, [nav])

    // Hide the claim banner if you already have a vet domain or if it's an observed wallet
    if (name || isObservedAccount) return <></>

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
