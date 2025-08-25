import { StackHeaderProps } from "@react-navigation/stack"
import React from "react"
import { RegisteredStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BaseView, BlurView } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    children: React.ReactNode
} & StackHeaderProps

export const TranslucentHeader = (props: Props) => {
    const insets = useSafeAreaInsets()
    const theme = useTheme()

    return (
        <BlurView
            blurAmount={10}
            blurType={theme.isDark ? "dark" : "light"}
            overlayColor="transparent"
            style={props.options.headerStyle as RegisteredStyle<ViewStyle>}>
            <BaseView flex={1} pt={insets.top} px={16}>
                {props.children}
            </BaseView>
        </BlurView>
    )
}
