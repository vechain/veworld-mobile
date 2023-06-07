import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { debug, useBottomSheetModal, useTheme } from "~Common"
import {
    BaseIcon,
    BaseText,
    BaseView,
    ScanAddressBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    //TODO: What do we do here ?
    const onScan = useCallback((address: string) => {
        debug("Scanned", address)
    }, [])

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
            <ScanAddressBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
            />
        </BaseView>
    )
})
