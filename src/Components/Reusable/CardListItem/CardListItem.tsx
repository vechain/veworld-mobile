import React from "react"
import { StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
    title: string
    subtitle?: string
    action: () => void
    testID?: string
    disabled?: boolean
}

export const CardListItem = ({ icon, title, subtitle, action, testID, disabled }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <TouchableOpacity
            style={[styles.root, disabled && styles.disabled]}
            onPress={action}
            activeOpacity={0.8}
            testID={testID}
            disabled={disabled}>
            <BaseView style={styles.content}>
                <BaseIcon
                    name={icon}
                    size={16}
                    iconPadding={4}
                    bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}
                />
                <BaseView flexGrow={1} flexDirection="column" gap={4}>
                    <BaseText typographyFont="bodySemiBold" numberOfLines={1}>
                        {title}
                    </BaseText>
                    <BaseText
                        typographyFont="smallCaptionMedium"
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        numberOfLines={1}>
                        {subtitle}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseIcon name="icon-chevron-right" size={16} color={theme.colors.editSpeedBs.title} />
        </TouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 24,
            paddingHorizontal: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100,
        },
        disabled: {
            // backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100,
            opacity: 0.5,
        },
        content: {
            gap: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
        },
    })
