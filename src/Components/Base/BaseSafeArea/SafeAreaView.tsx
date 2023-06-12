import React, { ReactNode } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import {
    SafeAreaViewProps,
    useSafeAreaInsets,
} from "react-native-safe-area-context"

type SafeAreaProps = {
    disableBottomSafeArea?: boolean
    disableTopSafeArea?: boolean
    disableSidesSafeArea?: boolean
    children: ReactNode
    style: StyleProp<ViewStyle>
} & SafeAreaViewProps

/**
 * This component will fix the issue with the SafeAreaView
 * https://github.com/th3rdwave/react-native-safe-area-context/issues/114
 */
export const SafeAreaView = (props: SafeAreaProps) => {
    const {
        disableBottomSafeArea = false,
        disableTopSafeArea = false,
        disableSidesSafeArea = false,
        children,
        style,
        ...others
    } = props

    const insets = useSafeAreaInsets()

    const baseStyle: Partial<StyleProp<ViewStyle>> = {
        flex: 1,
        paddingBottom: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingLeft: 0,
    }

    if (!disableBottomSafeArea) {
        baseStyle.paddingBottom = insets.bottom
    }

    if (!disableTopSafeArea) {
        baseStyle.paddingTop = insets.top
    }

    if (!disableSidesSafeArea) {
        baseStyle.paddingRight = insets.right
        baseStyle.paddingLeft = insets.left
    }

    return (
        <View style={[baseStyle, style]} {...others}>
            {children}
        </View>
    )
}
