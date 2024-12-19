import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    children: React.ReactNode
    actionText: string
    actionTestID?: string
    onPress: () => void
}

export const ActionBanner: React.FC<Props> = ({ children, actionText, actionTestID, onPress }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView style={[styles.container]}>
            <BaseView style={styles.childrenContainer}>{children}</BaseView>
            <BaseButton
                style={[styles.buttonContainer]}
                action={onPress}
                testID={actionTestID}
                title={actionText}
                textColor={theme.isDark ? COLORS.PURPLE_800 : COLORS.GREY_600}
            />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            padding: 8,
            borderRadius: 8,
            borderColor: theme.isDark ? COLORS.PURPLE_400 : COLORS.PURPLE_300,
            borderWidth: 1,
            backgroundColor: theme.isDark ? COLORS.PURPLE_900 : COLORS.PURPLE_50,
        },
        childrenContainer: {
            flexWrap: "wrap",
        },
        buttonContainer: {
            borderColor: theme.isDark ? COLORS.PURPLE_500 : theme.colors.cardBorder,
            borderWidth: 1,
            backgroundColor: theme.isDark ? COLORS.PURPLE_300 : COLORS.PURPLE_50,
            paddingVertical: 8,
        },
    })
