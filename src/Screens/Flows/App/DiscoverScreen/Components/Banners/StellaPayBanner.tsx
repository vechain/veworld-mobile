import React from "react"
import { Image, StyleSheet, ImageStyle } from "react-native"
import { BaseView, BaseText } from "~Components"
import { StellaPayBannerB3MO } from "~Assets"
import { useThemedStyles } from "~Hooks"
import LinearGradient from "react-native-linear-gradient"
import { COLORS } from "~Constants"

export const StellaPayBanner = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <LinearGradient
            colors={theme.colors.stellaPayBanner.background}
            angle={90}
            start={{ x: 0.32, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16}>
                <BaseText color={COLORS.WHITE}>{"StellaPayBanner"}</BaseText>
                <BaseText color={COLORS.WHITE}>{"Explore the StellaPay platform"}</BaseText>
            </BaseView>
            <Image source={StellaPayBannerB3MO} style={styles.image as ImageStyle} />
        </LinearGradient>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            minHeight: 108,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
        },
        image: {
            width: 123,
            height: 123,
            position: "absolute",
            right: 0,
            top: 8,
        },
    })
