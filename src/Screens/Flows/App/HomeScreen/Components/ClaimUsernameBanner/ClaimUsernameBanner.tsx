import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet, Text } from "react-native"
import { ActionBanner, BaseSpacer, BaseText, BaseView, useFeatureFlags, WrapTranslation } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector, useAppDispatch, onAccountAttemptClaim } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

type Props = {
    noMarginTop?: boolean
}

export const ClaimUsernameBanner = ({ noMarginTop = false }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { subdomainClaimFeature } = useFeatureFlags()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
        AccountUtils.isObservedAccount(selectedAccount) ||
        selectedAccount.device.type === DEVICE_TYPE.LEDGER
    )
        return <BaseSpacer height={8} />

    return (
        <BaseView w={100} mt={!noMarginTop ? 8 : 0} mb={12}>
            <ActionBanner actionText={LL.BTN_CLAIM()} actionTestID="claimUsernameBtn" onPress={onClaimPress}>
                <BaseText mx={4} color={theme.colors.actionBanner.title} typographyFont="captionRegular">
                    <WrapTranslation
                        message={LL.BANNER_TITLE_CLAIM_USERNAME()}
                        renderComponent={() => (
                            <Text style={styles.inlineBold}>{LL.COMMON_USERNAME().toLocaleLowerCase()}</Text>
                        )}
                    />
                </BaseText>
            </ActionBanner>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        inlineBold: {
            fontFamily: "Inter-SemiBold",
            fontSize: 12,
            fontWeight: "600",
            color: theme.colors.actionBanner.title,
        },
    })
