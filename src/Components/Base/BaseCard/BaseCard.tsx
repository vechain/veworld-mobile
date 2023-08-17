import React, { memo, useMemo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseView } from "../BaseView"
import { BaseTouchable } from "../BaseTouchable"

type Props = {
    containerStyle?: StyleProp<ViewStyle>
    selected?: boolean
    onPress?: () => void
    disableOpacityOnPressing?: boolean
}

export const BaseCard = memo(
    ({
        children,
        testID,
        style,
        containerStyle,
        selected,
        onPress,
        disableOpacityOnPressing = false,
    }: ViewProps & Props) => {
        const { styles } = useThemedStyles(baseStyles)

        const renderChildren = useMemo(() => {
            return (
                <BaseView style={[styles.view, style]} testID={testID}>
                    {children}
                </BaseView>
            )
        }, [children, style, styles.view, testID])
        return (
            <BaseView
                style={[
                    selected ? styles.selectedContainer : {},
                    styles.container,
                    containerStyle,
                ]}>
                {onPress ? (
                    <BaseTouchable
                        action={onPress}
                        haptics="Light"
                        activeOpacity={
                            disableOpacityOnPressing || !onPress ? 1 : 0.2
                        }>
                        {renderChildren}
                    </BaseTouchable>
                ) : (
                    renderChildren
                )}
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
