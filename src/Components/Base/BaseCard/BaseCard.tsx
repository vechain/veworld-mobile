import React, { memo, useMemo } from "react"
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseView } from "../BaseView"
import { TouchableOpacity } from "react-native-gesture-handler"

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
        ...otherProps
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
                {...otherProps}
                style={[
                    selected ? styles.selectedContainer : styles.unselectedContainer,
                    styles.container,
                    containerStyle,
                ]}>
                {onPress ? (
                    <TouchableOpacity
                        onPress={onPress}
                        containerStyle={styles.touchableContainer}
                        activeOpacity={disableOpacityOnPressing || !onPress ? 1 : 0.2}>
                        {renderChildren}
                    </TouchableOpacity>
                ) : (
                    renderChildren
                )}
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            borderRadius: 16,
            overflow: "hidden",
        },
        container: {
            width: "100%",
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderRadius: 16,
        },
        selectedContainer: {
            borderColor: theme.colors.text,
        },
        unselectedContainer: {
            borderColor: theme.colors.card,
        },
        view: {
            flexDirection: "row",
            padding: 12,
        },
    })
