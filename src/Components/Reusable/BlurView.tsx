import React from "react"
import { StyleSheet } from "react-native"
import { BlurView as BV, BlurViewProps } from "@react-native-community/blur"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = { blurAmount?: number } & BlurViewProps

// This is the best we can do about blurring the view
// I have also tried to use the expo blur library but it didn't work on android
export const BlurView = (props: Props) => {
    const { blurAmount = 3 } = props
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BV
            style={[StyleSheet.absoluteFill, styles.blurView, props.style]}
            blurType={"light"} // if we use "dark" the text will be too dark, that's why we use "light" and we add an overlay with a dark color and alpha
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor="white"
            {...props}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        blurView: theme.isDark
            ? {
                  // these values comes from several attempts to match the figma blur effect
                  // unfortunately there is no way to blur correctly on both ios and android but it's not that bad now
                  backgroundColor: isAndroid() ? "#09022f55" : "#09022fAA",
              }
            : {},
    })
