import React from "react"
import { Image, StyleSheet, ImageStyle, Platform } from "react-native"
import { BaseView } from "~Components"
import { StellaPayBannerB3MO, StellaPayLogoSVG } from "~Assets"
import { useThemedStyles } from "~Hooks"
import LinearGradient from "react-native-linear-gradient"
import { useI18nContext } from "~i18n"
import Markdown from "react-native-markdown-display"

export const StellaPayBanner = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <LinearGradient
            colors={theme.colors.stellaPayBanner.background}
            angle={90}
            start={{ x: 0.32, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={Platform.OS === "ios" ? styles.iosContainer : styles.androidContainer}>
            <BaseView alignItems={"flex-start"} gap={12} flex={1} justifyContent="center" style={styles.contentArea}>
                <StellaPayLogoSVG />
                <Markdown style={{ paragraph: styles.paragraph, body: styles.text }}>
                    {LL.BANNER_STELLAPAY_DESC()}
                </Markdown>
            </BaseView>
            <Image source={StellaPayBannerB3MO} style={styles.image as ImageStyle} />
        </LinearGradient>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        androidContainer: {
            minHeight: 108,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingRight: 140,
        },
        iosContainer: {
            width: "110%",
            height: 130,
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            alignItems: "flex-start",
            flexDirection: "row",
            position: "relative",
            top: -12,
            left: -18,
        },
        image: {
            width: 123,
            height: 123,
            position: "absolute",
            ...(Platform.OS === "ios" && {
                right: 0,
                top: 0,
            }),
            ...(Platform.OS === "android" && {
                right: -9,
                top: 8,
            }),
            top: 8,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 0,
        },
        text: {
            fontFamily: "Rubik",
            fontSize: 15,
            color: "#EEF3F7",
            margin: 0,
        },
        contentArea: {
            ...(Platform.OS === "ios" && {
                paddingRight: 100,
            }),
            ...(Platform.OS === "android" && {
                paddingRight: 0,
            }),
        },
    })
