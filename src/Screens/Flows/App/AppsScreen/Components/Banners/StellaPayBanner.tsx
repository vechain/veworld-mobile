import React from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import Markdown from "react-native-markdown-display"
import { StellaPayBannerB3MO, StellaPayLogoSVG } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import FontUtils from "~Utils/FontUtils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

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
                <Markdown
                    style={{
                        paragraph: styles.paragraph,
                        body: styles.text,
                        // Android does not support fontWeight 600
                        ...(!isAndroid() && { strong: styles.bold }),
                    }}>
                    {LL.BANNER_STELLAPAY_DESC()}
                </Markdown>
            </BaseView>
            <FastImage source={StellaPayBannerB3MO} style={styles.image as ImageStyle} />
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
            fontSize: FontUtils.font(13),
            color: "#EEF3F7",
            margin: 0,
        },
        bold: {
            fontWeight: "600",
        },
    })
