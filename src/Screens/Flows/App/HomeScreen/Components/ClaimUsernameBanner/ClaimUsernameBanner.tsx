import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { ActionBanner, BaseText, BaseView, useFeatureFlags } from "~Components"
import { useTheme, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector, useAppDispatch, onAccountAttemptClaim } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

type Props = {
    noMarginTop?: boolean
}

export const ClaimUsernameBanner = ({ noMarginTop = false }: Props) => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { subdomainClaimFeature } = useFeatureFlags()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const bannerTitle = LL.BANNER_TITLE_CLAIM_USERNAME()
    const [before, after] = bannerTitle.split("username")

    const { name } = useVns({
        address: selectedAccount.address,
        name: "",
    })

    const onClaimPress = useCallback(() => {
        //Set that the current account has tryed to claim username and hide banner
        dispatch(
            onAccountAttemptClaim({
                address: selectedAccount.address,
            }),
        )
        nav.navigate(Routes.CLAIM_USERNAME)
    }, [dispatch, nav, selectedAccount.address])

    // Hide the claim banner if you already have a vet domain or if it's an observed wallet
    if (
        !subdomainClaimFeature.enabled ||
        selectedAccount.hasAttemptedClaim ||
        name ||
        AccountUtils.isObservedAccount(selectedAccount)
    )
        return <></>

    return (
        <BaseView w={100} mt={!noMarginTop ? 8 : 0}>
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
