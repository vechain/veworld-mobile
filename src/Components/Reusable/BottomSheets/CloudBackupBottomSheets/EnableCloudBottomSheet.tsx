import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { DefaultBottomSheet } from "../DefaultBottomSheet"
import { BaseButton } from "~Components"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onClose: () => void
}

export const EnableCloudBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const secondaryButton = (
        <BaseButton
            w={100}
            style={styles.secondaryButton}
            variant="outline"
            textColor={theme.colors.text}
            typographyFont="buttonMedium"
            haptics="Light"
            title={LL.COMMON_BTN_OK()}
            action={onClose}
        />
    )

    return (
        <DefaultBottomSheet
            ref={ref}
            title={LL.ALERT_TITLE_ICLOUD_ERROR()}
            description={LL.ALERT_MSG_ICLOUD_ERROR()}
            secondaryButton={secondaryButton}
            icon="alert-circle-outline"
        />
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        secondaryButton: {
            borderRadius: 8,
            paddingVertical: 14,
            borderColor: theme.colors.text,
        },
    })
