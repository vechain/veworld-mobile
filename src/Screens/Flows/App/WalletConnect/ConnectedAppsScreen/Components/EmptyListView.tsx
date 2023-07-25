import React, { useCallback } from "react"
import { useCameraBottomSheet } from "~Hooks"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    useWalletConnect,
} from "~Components"
import { COLORS, ScanTarget } from "~Constants"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"
import HapticsService from "~Services/HapticsService"

export const EmptyListView = () => {
    const { LL } = useI18nContext()
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
        target: ScanTarget.WALLET_CONNECT,
    })

    return (
        <BaseView mx={20} justifyContent="center" alignItems="center">
            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                <BaseTouchable action={handleOpenCamera}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={baseStyles.quickNFTActions}>
                        <BaseIcon name="plus" size={55} />
                        <BaseText
                            color={COLORS.DARK_PURPLE}
                            typographyFont="bodyMedium">
                            {LL.ADD_APP()}
                        </BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseText mx={20} typographyFont="body" align="center">
                {LL.CONNECTED_APPS_SCREEN_NO_CONNECTED_APP()}
            </BaseText>
            {RenderCameraModal}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    quickNFTActions: {
        width: 140,
        height: 100,
    },
})
