import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { getScannedAddress, useRealm } from "~Storage"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { cache } = useRealm()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const openCamera = useCallback(async () => {
        const scannedAddress = getScannedAddress(cache)
        cache.write(() => (scannedAddress.isShowSend = true))
        nav.navigate(Routes.CAMERA_STACK)
    }, [cache, nav])

    return (
        <BaseView
            w={100}
            px={20}
            orientation="row"
            align="center"
            justify="space-between">
            <BaseView align="flex-start" selfAlign="flex-start">
                <BaseText typographyFont="body">
                    {LL.TITLE_WELCOME_TO()}
                </BaseText>
                <BaseText typographyFont="largeTitle">{LL.VEWORLD()}</BaseText>
            </BaseView>

            <BaseView orientation="row">
                <BaseIcon
                    name={"flip-horizontal"}
                    size={24}
                    color={theme.colors.primary}
                    action={openCamera}
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
