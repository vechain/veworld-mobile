import React from "react"
import { StyleSheet } from "react-native"
import { Touchable, TouchableProps } from "react-native-gesture-handler"

export type TouchableOpacityProps = Omit<TouchableProps, "ref">

const refuseResponder = () => false

// React Native's touchables validate presses against the shadow tree, which IOS_SYNCHRONOUSLY_UPDATE_UI_PROPS
// leaves stale under Reanimated transforms (software-mansion/react-native-reanimated#10121). This button
// hit-tests natively instead, keeping React Native's TouchableOpacity defaults and disabled behaviour.
export const TouchableOpacity = ({
    activeOpacity = 0.2,
    disabled = false,
    accessible = true,
    accessibilityState,
    style,
    ...rest
}: TouchableOpacityProps & Pick<TouchableProps, "ref">) => {
    const flatStyle = StyleSheet.flatten(style)
    const defaultOpacity = typeof flatStyle?.opacity === "number" ? flatStyle.opacity : 1

    return (
        <Touchable
            {...rest}
            style={flatStyle}
            disabled={disabled}
            accessible={accessible}
            accessibilityState={{ disabled, ...accessibilityState }}
            defaultOpacity={defaultOpacity}
            activeOpacity={activeOpacity}
            onStartShouldSetResponder={disabled ? refuseResponder : undefined}
        />
    )
}
