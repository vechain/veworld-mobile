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
    }: ViewProps & Props) => {
        const { styles } = useThemedStyles(baseStyles(selected))

        const renderChildren = useMemo(() => {
            return (
                <BaseView
                    style={[
                        styles.view,
                        style,
                        selected ? styles.selectedContainer : {},
                    ]}
                    testID={testID}>
                    {children}
                </BaseView>
            )
        }, [
            children,
            selected,
            style,
            styles.selectedContainer,
            styles.view,
            testID,
        ])

        return (
            <BaseView
                style={[
                    // selected ? styles.selectedContainer : {},
                    styles.container,
                    containerStyle,
                ]}>
                {onPress ? (
                    <TouchableOpacity
                        onPress={onPress}
                        containerStyle={styles.touchableContainer}
                        activeOpacity={
                            disableOpacityOnPressing || !onPress ? 1 : 0.2
                        }>
                        {renderChildren}
                    </TouchableOpacity>
                ) : (
                    renderChildren
                )}
            </BaseView>
        )
    },
)

const baseStyles = (selected: boolean | undefined) => (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            borderRadius: 16,
            overflow: "hidden",
        },
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
            padding: selected ? 11 : 12,
            backgroundColor: theme.colors.card,
        },
    })
