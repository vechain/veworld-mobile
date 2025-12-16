import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type EmptyActivityListProps = {
    icon?: IconKey
    label: string
    description?: string
    hasCardStyle?: boolean
    onPress?: () => void
}

export const EmptyActivityList = React.memo<EmptyActivityListProps>(({ icon, label }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.rootContainer}>
            {icon && (
                <BaseIcon
                    name={icon}
                    size={32}
                    style={styles.iconContainer}
                    color={theme.isDark ? COLORS.GREY_200 : COLORS.GREY_400}
                    borderRadius={99}
                />
            )}

            <BaseSpacer height={24} />

            <BaseText typographyFont="body" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} align="center">
                {label}
            </BaseText>
        </BaseView>
    )
})

EmptyActivityList.displayName = "EmptyActivityList"

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        cardContainer: {
            padding: 32,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 16,
            alignSelf: "stretch",
            borderRadius: 12,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
    })
