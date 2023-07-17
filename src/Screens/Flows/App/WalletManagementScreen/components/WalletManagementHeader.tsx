import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useTheme } from "~Hooks"
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
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseText typographyFont="title">
                {LL.TITLE_WALLET_MANAGEMENT()}
            </BaseText>
            <BaseView flexDirection="row">
                <BaseIcon
                    haptics="Light"
                    size={24}
                    name="plus"
                    bg={theme.colors.secondary}
                    action={goToCreateWalletFlow}
                />
            </BaseView>
        </BaseView>
    )
}
