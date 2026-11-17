import React from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import Markdown from "react-native-markdown-display"
import { StellaPayBannerB3MO, StellaPayLogoSVG } from "~Assets"
import { BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import FontUtils from "~Utils/FontUtils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

export const StellaPayBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.container}>
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
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    const [from, to] = theme.colors.stellaPayBanner.background
    return StyleSheet.create({
        container: {
            minHeight: 108,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingRight: 140,
            backgroundImage: `linear-gradient(90deg, ${from} 32%, ${to})`,
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
}
