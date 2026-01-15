import React from "react"
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type BaseBottomSheetV2HeaderButtonProps = TouchableOpacityProps & {
    name: IconKey
    iconTestID?: string
    iconSize?: number
}

export const BaseBottomSheetV2HeaderButton = ({
    style,
    name,
    iconTestID,
    iconSize,
    ...props
}: BaseBottomSheetV2HeaderButtonProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <TouchableOpacity style={[styles.settingsBtn, style]} {...props}>
            <BaseIcon
                name={name}
                testID={iconTestID}
                color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
                size={iconSize}
            />
        </TouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        settingsBtn: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
            borderRadius: 6,
        },
    })
