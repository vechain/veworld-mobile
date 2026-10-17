import { BlurView as BV, BlurViewProps } from "@react-native-community/blur"
import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = { blurAmount?: number } & BlurViewProps

// This is the best we can do about blurring the view
// I have also tried to use the expo blur library but it didn't work on android
export const BlurView = ({
    children,
    style,
    blurAmount = 3,
    // if we use "dark" the text will be too dark, that's why we use "light" and we add an overlay with a dark color and alpha
    blurType = "light",
    ...blurProps
}: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    // Fabric mounts children beneath the native effect view, so the blur is a backdrop sibling instead of a parent.
    const { backgroundColor, ...layoutStyle } = useMemo(() => StyleSheet.flatten(style) ?? {}, [style])
    const backdropStyle = useMemo(
        () => [StyleSheet.absoluteFill, styles.blurView, backgroundColor !== undefined && { backgroundColor }],
        [backgroundColor, styles.blurView],
    )

    return (
        <View style={layoutStyle}>
            <BV
                style={backdropStyle}
                blurType={blurType}
                blurAmount={blurAmount}
                reducedTransparencyFallbackColor="white"
                overlayColor="transparent"
                {...blurProps}
            />
            {children}
        </View>
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
