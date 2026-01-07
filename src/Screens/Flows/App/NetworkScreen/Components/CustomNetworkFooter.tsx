import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useOfflineCallback } from "~Hooks/useOfflineCallback"
import { useI18nContext } from "~i18n"
import { AddCustomNetworkBottomSheet } from "./AddCustomNetworkBottomSheet"

export const CustomNetworkFooter = () => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const { ref, onOpen } = useBottomSheetModal()

    const _handleOpen = useCallback(() => onOpen(), [onOpen])

    const handleOpen = useOfflineCallback(_handleOpen)

    return (
        <>
            <BaseButton
                style={styles.root}
                action={handleOpen}
                py={10}
                px={12}
                leftIcon={<BaseIcon name="icon-plus" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} size={20} />}
                bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
                textColor={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
                typographyFont="bodySemiBold">
                {LL.NETWORK_ADD_CUSTOM()}
            </BaseButton>
            <AddCustomNetworkBottomSheet bsRef={ref} />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: { marginTop: 24, justifyContent: "center", gap: 12 },
    })
