import React, { useCallback } from "react"
import { useBottomSheetModal, useTheme } from "~Hooks"
import {
    BaseIcon,
    BaseText,
    BaseView,
    ScanBottomSheet,
    useWalletConnect,
} from "~Components"
import { useI18nContext } from "~i18n"
import { ScanTarget } from "~Constants"

type Props = {
    showAddButton?: boolean
}

export const ConnectedAppsHeader = ({ showAddButton = true }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
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
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseText typographyFont="title">
                {LL.CONNECTED_APPS_SCREEN_TITLE()}
            </BaseText>
            {showAddButton && (
                <BaseView flexDirection="row">
                    <BaseIcon
                        size={24}
                        name="plus"
                        bg={theme.colors.secondary}
                        action={openScanAddressSheet}
                    />
                </BaseView>
            )}

            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                target={ScanTarget.WALLET_CONNECT}
            />
        </BaseView>
    )
}
