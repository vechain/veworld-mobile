import React from "react"
import { StyleSheet, Image, ImageStyle } from "react-native"
import { VeBetterDaoBannerB3MO, VeBetterLogoGreenSVG, VeBetterSVG } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import Markdown from "react-native-markdown-display"

export const VeBetterDaoBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView flexDirection="row" borderRadius={12} px={16} py={12} bg={"#002234"} style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={0.8}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
                    <VeBetterLogoGreenSVG />
                    <VeBetterSVG color={COLORS.WHITE} width={72} height={14} />
                </BaseView>
                <Markdown style={{ paragraph: styles.paragraph, body: styles.text, strong: { color: "#B1F16C" } }}>
                    {LL.BANNER_VEBETTER_DESC()}
                </Markdown>
            </BaseView>
            <Image source={VeBetterDaoBannerB3MO} style={styles.image as ImageStyle} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            minHeight: 108,
            alignItems: "center",
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
            color: "#EEF3F7",
        },
    })
