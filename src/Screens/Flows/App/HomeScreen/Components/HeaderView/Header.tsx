import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useCameraBottomSheet, useCopyClipboard, useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseView, useWalletConnect } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { ScanTarget } from "~Constants"
import { SelectedNetworkViewer } from "~Components/Reusable/SelectedNetworkViewer"
import { AddressUtils, WalletConnectUtils, debug } from "~Utils"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { onPair } = useWalletConnect()

    const { onCopyToClipboard } = useCopyClipboard()

    const onScan = useCallback(
        (qrData: string) => {
            if (WalletConnectUtils.isValidURI(qrData)) {
                HapticsService.triggerImpact({ level: "Light" })
                onPair(qrData)
            } else if (AddressUtils.isValid(qrData)) {
                onCopyToClipboard(qrData, LL.COMMON_LBL_ADDRESS())
            } else {
                debug("Header:onScan - Invalid QR: ", qrData)
            }
        },
        [LL, onCopyToClipboard, onPair],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan,
        targets: [ScanTarget.WALLET_CONNECT, ScanTarget.ADDRESS],
    })

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    return (
        <BaseView
            w={100}
            px={20}
            pb={8}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="largeTitle" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <SelectedNetworkViewer />
                <BaseIcon
                    name={"qrcode-scan"}
                    size={24}
                    color={theme.colors.text}
                    action={handleOpenCamera}
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

            {RenderCameraModal}
        </BaseView>
    )
})
