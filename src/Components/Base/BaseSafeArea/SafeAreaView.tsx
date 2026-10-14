import React, { ReactNode } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { SafeAreaViewProps, useSafeAreaInsets } from "react-native-safe-area-context"

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

    const baseStyle: ViewStyle = {
        flex: 1,
        paddingBottom: disableBottomSafeArea ? 0 : insets.bottom,
        paddingTop: disableTopSafeArea ? 0 : insets.top,
        paddingRight: disableSidesSafeArea ? 0 : insets.right,
        paddingLeft: disableSidesSafeArea ? 0 : insets.left,
    }

    return (
        <View style={[baseStyle, style]} {...others}>
            {children}
        </View>
    )
}
