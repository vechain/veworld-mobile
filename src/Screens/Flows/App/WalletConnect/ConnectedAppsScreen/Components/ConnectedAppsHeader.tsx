import React, { useCallback } from "react"
import { useCameraBottomSheet, useTheme } from "~Hooks"
import { BaseIcon, BaseView, useWalletConnect } from "~Components"
import { ScanTarget } from "~Constants"
import HapticsService from "~Services/HapticsService"

type Props = {
    showAddButton?: boolean
}

export const ConnectedAppsHeader = ({ showAddButton = true }: Props) => {
    const theme = useTheme()
    const { onPair } = useWalletConnect()

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
            {showAddButton && (
                <BaseView flexDirection="row">
                    <BaseIcon size={24} name="icon-plus" bg={theme.colors.secondary} action={handleOpenCamera} />
                </BaseView>
            )}

            {RenderCameraModal}
        </BaseView>
    )
}
