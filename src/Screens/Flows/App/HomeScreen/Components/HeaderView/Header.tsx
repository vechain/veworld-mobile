import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useBottomSheetModal, useTheme } from "~Common"
import {
    BaseIcon,
    BaseText,
    BaseView,
    ScanWalletConnectBottomSheet,
    useWalletConnect,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

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
                    name={"flip-horizontal"}
                    size={24}
                    color={theme.colors.text}
                    action={openScanAddressSheet}
                    mx={12}
                />

                <BaseIcon
                    name={"wallet-outline"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={goToWalletManagement}
                />
            </BaseView>
            <ScanWalletConnectBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
            />
        </BaseView>
    )
})
