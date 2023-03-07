import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const WalletManagementHeader = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const nav = useNavigation()

    const goToCreateWalletFlow = useCallback(() => {
        nav.navigate(Routes.CREATE_WALLET_FLOW)
    }, [nav])

    return (
        <BaseView
            align="center"
            justify="space-between"
            orientation="row"
            px={20}>
            <BaseText typographyFont="title">
                {LL.TITLE_WALLET_MANAGEMENT()}
            </BaseText>
            <BaseView align="center" orientation="row">
                <BaseIcon
                    size={24}
                    name="priority-low"
                    style={{ marginHorizontal: 16 }}
                    color={theme.colors.text}
                />
                <BaseIcon
                    size={24}
                    name="plus"
                    bg={theme.colors.secondary}
                    action={goToCreateWalletFlow}
                />
            </BaseView>
        </BaseView>
    )
}
