/* eslint-disable react-native/no-inline-styles */
import React from "react"
import { ViewProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "~Common"

type Props = {
    bg?: string
    transparent?: boolean
    children?: React.ReactNode
    grow?: number
} & ViewProps

export const BaseSafeArea = (props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()
    return (
        <SafeAreaView
            style={[
                {
                    flexGrow: props.grow,
                    backgroundColor: props.transparent
                        ? "transparent"
                        : props.bg
                        ? props.bg
                        : theme.colors.background,
                },
                style,
            ]}
            {...otherProps}>
            {props.children}
        </SafeAreaView>
    )
}
