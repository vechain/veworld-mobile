import React, { useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseIcon, BaseText } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
    /**
     * Set to true to have an active state
     */
    active: boolean
    label: string
    onPress: () => void
    testID?: string
}

export const CollectiblesActionButton = ({ icon, active, label, onPress, testID }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const color = useMemo(() => {
        if (active) return theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500
    }, [active, theme.isDark])

    return (
        <Pressable onPress={onPress} style={[styles.root, active && styles.rootActive]} testID={testID}>
            <BaseIcon name={icon} color={color} size={24} />
            <BaseText color={color} typographyFont="smallCaptionSemiBold">
                {label}
            </BaseText>
        </Pressable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            flexDirection: "column",
            gap: 12,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
            flex: 1,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            alignItems: "center",
        },
        rootActive: {
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            borderWidth: 2,
        },
    })
