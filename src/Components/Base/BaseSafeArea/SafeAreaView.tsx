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
        marginBottom: 0,
        marginTop: 0,
        marginRight: 0,
        marginLeft: 0,
    }

    if (!disableBottomSafeArea) {
        baseStyle.marginBottom = insets.bottom
    }

    if (!disableTopSafeArea) {
        baseStyle.marginTop = insets.top
    }

    if (!disableSidesSafeArea) {
        baseStyle.marginRight = insets.right
        baseStyle.marginLeft = insets.left
    }

    return (
        <View style={[baseStyle, style]} {...others}>
            {children}
        </View>
    )
}
