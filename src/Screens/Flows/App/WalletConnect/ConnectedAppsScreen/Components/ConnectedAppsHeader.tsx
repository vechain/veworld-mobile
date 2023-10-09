import React, { useCallback } from "react"
import { useCameraBottomSheet, useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { ScanTarget } from "~Constants"
import HapticsService from "~Services/HapticsService"
import { useWcPairing } from "~Components/Providers/WalletConnectProvider/hooks/useWcPairing"

type Props = {
    showAddButton?: boolean
}

export const ConnectedAppsHeader = ({ showAddButton = true }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { onPair } = useWcPairing()

    const onScan = useCallback(
        (uri: string) => {
            HapticsService.triggerImpact({ level: "Light" })
            onPair(uri)
        },
        [onPair],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan,
        targets: [ScanTarget.WALLET_CONNECT],
    })

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
                        action={handleOpenCamera}
                    />
                </BaseView>
            )}

            {RenderCameraModal}
        </BaseView>
    )
}
