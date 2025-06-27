import React from "react"
import { Image, ImageBackground, ImageStyle, StyleSheet } from "react-native"
import Markdown from "react-native-markdown-display"
import { StargateB3MO, StargateBannerBackground, StargateLogo } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

export const StargateBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.root}>
            <ImageBackground source={StargateBannerBackground} style={styles.container}>
                <BaseView alignItems={"flex-start"} gap={16} flex={1} justifyContent="center">
                    <StargateLogo />
                    <Markdown style={{ paragraph: styles.paragraph, body: styles.text, strong: styles.bold }}>
                        {LL.BANNER_STARGATE_DESC()}
                    </Markdown>
                </BaseView>
                <Image source={StargateB3MO} style={styles.image as ImageStyle} />
            </ImageBackground>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: { borderRadius: 12, overflow: "hidden" },
        container: {
            minHeight: 108,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingRight: 140,
            backgroundColor: "#0B0C10",
            position: "relative",
        },
        image: {
            width: 114,
            height: 114,
            position: "absolute",
            right: 15,
            top: -5,
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
        bold: {
            fontWeight: "600",
        },
    })
