import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useBottomSheetModal, useTheme } from "~Hooks"
import {
    BaseIcon,
    BaseText,
    BaseView,
    ScanBottomSheet,
    useWalletConnect,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { ScanTarget } from "~Constants"
import HapticsService from "~Services/HapticsService"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { onPair } = useWalletConnect()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const onScan = useCallback(
        (uri: string) => {
            HapticsService.triggerImpact({ level: "Light" })
            onPair(uri)
        },
        [onPair],
    )

    return (
        <BaseView
            w={100}
            px={20}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="largeTitle" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    name={"qrcode-scan"}
                    size={24}
                    color={theme.colors.text}
                    action={openScanAddressSheet}
                    mx={12}
                    haptics="Light"
                />

                <BaseIcon
                    name={"wallet-outline"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={goToWalletManagement}
                    haptics="Light"
                />
            </BaseView>
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                target={ScanTarget.WALLET_CONNECT}
            />
        </BaseView>
    )
})
