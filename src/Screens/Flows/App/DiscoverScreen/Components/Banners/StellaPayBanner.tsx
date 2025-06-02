import React from "react"
import { Image, StyleSheet, ImageStyle } from "react-native"
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
            style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={0.8}>
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
        container: {
            flex: 1,
            minHeight: 108,
            width: "100%",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: "center",
            flexDirection: "row",
        },
        image: {
            width: 123,
            height: 123,
            position: "absolute",
            right: 0,
            bottom: 0,
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
    })
