import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
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
                textColor={theme.colors.actionBanner.buttonText}
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
            borderColor: theme.colors.actionBanner.border,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.background,
        },
        childrenContainer: {
            flexWrap: "wrap",
            flexBasis: 210,
        },
        buttonContainer: {
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            paddingVertical: 8,
        },
    })
