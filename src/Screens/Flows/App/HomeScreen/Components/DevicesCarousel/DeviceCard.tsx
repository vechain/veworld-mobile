import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { useTheme, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useThemeType } from "~Model"
import { Device } from "~Storage"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    device: Device
}

export const DeviceCard: React.FC<Props> = memo(props => {
    const { style, device, ...animatedViewProps } = props
    const theme = useTheme()
    const themedStyle = useThemedStyles(baseStyles)
    return (
        <Animated.View style={themedStyle.container} {...animatedViewProps}>
            <BaseView
                background={theme.colors.primary}
                isFlex
                justify="center"
                align="center"
                radius={24}
                style={style}>
                <BaseText color={theme.colors.tertiary}>
                    {device.alias} ({device.accounts.length} accounts)
                </BaseText>
            </BaseView>
        </Animated.View>
    )
})

const baseStyles = (theme: useThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        itemContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 24,
        },
    })
