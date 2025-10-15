import React from "react"
import { BaseIcon, BaseView } from "~Components"
import { ScanTarget } from "~Constants"
import { useCameraBottomSheet, useTheme } from "~Hooks"

type Props = {
    showAddButton?: boolean
}

export const ConnectedAppsHeader = ({ showAddButton = true }: Props) => {
    const theme = useTheme()

    const { RenderCameraModal, handleOpenOnlyScanCamera } = useCameraBottomSheet({
        targets: [ScanTarget.WALLET_CONNECT],
    })

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            {showAddButton && (
                <BaseView flexDirection="row">
                    <BaseIcon
                        size={24}
                        name="icon-plus"
                        bg={theme.colors.secondary}
                        action={handleOpenOnlyScanCamera}
                    />
                </BaseView>
            )}

            {RenderCameraModal}
        </BaseView>
    )
}
