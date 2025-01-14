import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ActionBanner, BaseText, BaseView, useFeatureFlags } from "~Components"
import { useTheme, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

export const ClaimUsernameBanner = () => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { subdomainClaimFeature } = useFeatureFlags()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const bannerTitle = LL.BANNER_TITLE_CLAIM_USERNAME()
    const [before, after] = bannerTitle.split("username")

    const { name } = useVns({
        address: selectedAccount.address,
        name: "",
    })

    const onClaimPress = useCallback(() => {
        nav.navigate(Routes.CLAIM_USERNAME)
    }, [nav])

    // Hide the claim banner if you already have a vet domain or if it's an observed wallet
    if (name || AccountUtils.isObservedAccount(selectedAccount) || !subdomainClaimFeature.enabled) return <></>

    return (
        <BaseView w={100} px={20}>
            <ActionBanner actionText={LL.BTN_CLAIM()} actionTestID="claimUsernameBtn" onPress={onClaimPress}>
                <BaseText color={theme.colors.actionBanner.title} typographyFont="captionRegular">
                    {before}
                    <BaseText typographyFont="captionSemiBold" color={theme.colors.actionBanner.title}>
                        {"username"}
                    </BaseText>
                    {after}
                </BaseText>
            </ActionBanner>
        </BaseView>
    )
}
