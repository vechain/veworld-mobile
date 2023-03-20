import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useCameraPermissions, useDisclosure, useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView, QRCodeReader } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const Header = memo(() => {
    const theme = useTheme()
    const { checkPermissions } = useCameraPermissions()
    const { isOpen, shouldOpen, onClose } = useDisclosure()

    const nav = useNavigation()
    const { LL } = useI18nContext()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const openCamera = useCallback(async () => {
        let result = await checkPermissions()
        shouldOpen(!!result)
    }, [checkPermissions, shouldOpen])

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

            <QRCodeReader onClose={onClose} isOpen={isOpen} />
        </BaseView>
    )
})
