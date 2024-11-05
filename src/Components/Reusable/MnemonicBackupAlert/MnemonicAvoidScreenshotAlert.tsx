import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

export const MnemonicAvoidScreenshotAlert = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const iconColor = useMemo(() => {
        return theme.isDark ? COLORS.PASTEL_BLUE : COLORS.MEDIUM_BLUE
    }, [theme])

    return (
        <BaseView flexDirection="row" justifyContent="flex-start" alignItems="flex-start" pr={8}>
            <BaseIcon name="information-outline" color={iconColor} size={16} />
            <BaseView ml={8} mr={24}>
                <BaseText typographyFont="captionRegular" style={styles.infoText}>
                    {LL.ALERT_DONT_SCREENSHOT_MNEMONIC()}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        infoText: {
            color: theme.isDark ? COLORS.LIGHT_BLUE : COLORS.DARK_BLUE_ALERT,
        },
    })
