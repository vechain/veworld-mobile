import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
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
        <BaseView flexDirection="row" w={100}>
            <BaseText typographyFont="title">
                {LL.TITLE_WALLET_MANAGEMENT()}
            </BaseText>
            <BaseView flexDirection="row">
                <BaseIcon
                    size={24}
                    name="priority-low"
                    style={styles.icon}
                    color={theme.colors.text}
                    disabled={true}
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

const styles = StyleSheet.create({
    icon: { marginRight: 16 },
})
