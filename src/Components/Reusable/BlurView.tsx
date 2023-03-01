import React, { useMemo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { BlurView as BV, BlurViewProps } from "@react-native-community/blur"
import { useTheme } from "~Common"

type Props = {
    cornerRadius?: number
} & BlurViewProps &
    ViewProps

export const BlurView = (props: Props) => {
    const theme = useTheme()

    const blurType = useMemo(() => (theme.isDark ? "dark" : "light"), [theme])
    return (
        <BV
            style={[
                StyleSheet.absoluteFill,
                {
                    borderTopLeftRadius: props.cornerRadius,
                    borderBottomLeftRadius: props.cornerRadius,
                },
            ]}
            blurType={blurType}
            blurAmount={5}
            reducedTransparencyFallbackColor="white"
        />
    )
}
