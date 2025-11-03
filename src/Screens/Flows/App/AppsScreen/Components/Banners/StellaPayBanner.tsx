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
            style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={1} justifyContent="center">
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
        container: {
            minHeight: 108,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingRight: 140,
        },
        image: {
            width: 123,
            height: 123,
            position: "absolute",
            right: -9,
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
