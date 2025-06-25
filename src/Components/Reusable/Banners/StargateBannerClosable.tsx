import React from "react"
import { Image, ImageBackground, ImageStyle, StyleSheet } from "react-native"
import Markdown from "react-native-markdown-display"
import { StargateB3MO, StargateBannerBackground, StargateLogo } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

export const StargateBannerClosable = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.root}>
            <ImageBackground source={StargateBannerBackground} style={styles.container} resizeMode="cover">
                <BaseView alignItems={"flex-start"} gap={8} flex={1} justifyContent="center">
                    <StargateLogo />
                    <Markdown style={{ paragraph: styles.paragraph, body: styles.text }}>
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
        root: { borderRadius: 12, overflow: "hidden", position: "relative" },
        container: {
            minHeight: 88,
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingRight: 140,
        },
        image: {
            width: 130,
            height: 130,
            position: "absolute",
            right: 10,
            top: -10,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 0,
        },
        text: {
            fontFamily: "Rubik",
            fontSize: 14,
            color: "#EEF3F7",
            margin: 0,
        },
    })
