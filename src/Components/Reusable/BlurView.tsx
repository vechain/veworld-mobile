import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BlurView as BV, BlurViewProps } from "@react-native-community/blur"
import { useTheme } from "~Common"

type Props = { blurAmount?: number } & BlurViewProps

export const BlurView = (props: Props) => {
    const { blurAmount = 5 } = props
    const theme = useTheme()

    const blurType = useMemo(() => (theme.isDark ? "dark" : "light"), [theme])
    return (
        <BV
            style={[StyleSheet.absoluteFill, props.style]}
            blurType={blurType}
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor="white"
            {...props}
        />
    )
}
