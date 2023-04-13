import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const onOpenCamera = useCallback(() => {
        nav.navigate(Routes.CAMERA, {
            onScan: () => {},
        })
    }, [nav])

    return (
        <BaseView
            w={100}
            px={20}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="body">
                    {LL.TITLE_WELCOME_TO()}
                </BaseText>
                <BaseText typographyFont="largeTitle">{LL.VEWORLD()}</BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    name={"flip-horizontal"}
                    size={24}
                    color={theme.colors.primary}
                    action={onOpenCamera}
                    mx={12}
                />

                <BaseIcon
                    name={"wallet-outline"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={goToWalletManagement}
                />
            </BaseView>
        </BaseView>
    )
})
