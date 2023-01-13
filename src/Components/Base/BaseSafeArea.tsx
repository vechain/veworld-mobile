/* eslint-disable react-native/no-inline-styles */
import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "~Common"

type Props = {
    bg?: string
    transparent?: boolean
    children?: React.ReactNode
    grow?: number
}

export const BaseSafeArea = (props: Props) => {
    const theme = useTheme()
    return (
        <SafeAreaView
            style={{
                flexGrow: props.grow,
                backgroundColor: props.transparent
                    ? "transparent"
                    : props.bg
                    ? props.bg
                    : theme.colors.background,
            }}>
            {props.children}
        </SafeAreaView>
    )
}
