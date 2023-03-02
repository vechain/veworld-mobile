import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BlurView as BV, BlurViewProps } from "@react-native-community/blur"
import { useTheme } from "~Common"

type Props = BlurViewProps

export const BlurView = (props: Props) => {
    const theme = useTheme()

    const blurType = useMemo(() => (theme.isDark ? "dark" : "light"), [theme])
    return (
        <BV
            style={[StyleSheet.absoluteFill]}
            blurType={blurType}
            blurAmount={5}
            reducedTransparencyFallbackColor="white"
            {...props}
        />
    )
}
