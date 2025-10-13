import React from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import Markdown from "react-native-markdown-display"
import { VeBetterDaoBannerB3MO, VeBetterLogoGreenSVG, VeBetterSVG } from "~Assets"
import { BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

export const VeBetterDaoBanner = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <LinearGradient
            colors={theme.colors.veBetterDaoBanner.background}
            angle={270}
            useAngle
            locations={[0, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={0.8}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
                    <VeBetterLogoGreenSVG color={theme.colors.veBetterDaoBanner.vbdLogo.symbol} />
                    <VeBetterSVG color={theme.colors.veBetterDaoBanner.vbdLogo.text} width={72} height={14} />
                </BaseView>
                <Markdown
                    style={{
                        paragraph: styles.paragraph,
                        body: styles.text,
                        // Android does not support fontWeight 600
                        ...(!isAndroid() && {
                            strong: { color: theme.colors.veBetterDaoBanner.text, fontWeight: "600" },
                        }),
                    }}>
                    {LL.BANNER_VEBETTER_DESC()}
                </Markdown>
            </BaseView>
            <FastImage source={VeBetterDaoBannerB3MO} style={styles.image as ImageStyle} />
        </LinearGradient>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            minHeight: 108,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
        },
        image: {
            width: 100,
            height: 100,
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
            color: theme.colors.veBetterDaoBanner.text,
        },
    })
