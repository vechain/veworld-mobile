import React, { memo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseView } from "../BaseView"
import { BaseTouchable } from "../BaseTouchable"

type Props = {
    containerStyle?: StyleProp<ViewStyle>
    selected?: boolean
    onPress?: () => void
}

export const BaseCard = memo(
    ({
        children,
        testID,
        style,
        containerStyle,
        selected,
        onPress,
    }: ViewProps & Props) => {
        const { styles } = useThemedStyles(baseStyles)
        return (
            <BaseView
                style={[
                    selected ? styles.selectedContainer : {},
                    styles.container,
                    containerStyle,
                ]}>
                <BaseTouchable action={onPress} haptics="Light">
                    <BaseView style={[styles.view, style]} testID={testID}>
                        {children}
                    </BaseView>
                </BaseTouchable>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
        view: {
            flexDirection: "row",
            borderRadius: 16,
            padding: 12,
            backgroundColor: theme.colors.card,
        },
    })
