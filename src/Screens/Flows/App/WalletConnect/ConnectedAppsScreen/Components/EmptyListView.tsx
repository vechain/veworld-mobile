import React, { useCallback } from "react"
import { useBottomSheetModal } from "~Hooks"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    ScanBottomSheet,
    useWalletConnect,
} from "~Components"
import { COLORS, ScanTarget } from "~Constants"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"

export const EmptyListView = () => {
    const { LL } = useI18nContext()
    const { onPair } = useWalletConnect()

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
        <BaseView mx={20} justifyContent="center" alignItems="center">
            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                <BaseTouchable action={openScanAddressSheet}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={baseStyles.quickNFTActions}>
                        <BaseIcon name="plus" size={38} />
                        <BaseText>{"Add App"}</BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseText mx={20} typographyFont="subTitleLight" align="center">
                {LL.CONNECTED_APPS_SCREEN_NO_CONNECTED_APP()}
            </BaseText>
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                target={ScanTarget.WALLET_CONNECT}
            />
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    quickNFTActions: {
        width: 140,
        height: 100,
    },
})
