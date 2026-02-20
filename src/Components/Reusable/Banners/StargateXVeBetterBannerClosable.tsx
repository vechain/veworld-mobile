import React from "react"
import { Image, ImageBackground, ImageStyle, StyleSheet } from "react-native"
import Markdown from "react-native-markdown-display"
import { StargateBannerBackground, StargateLogo, StargateXVeBetterBannerB3MO } from "~Assets"
import { BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import FontUtils from "~Utils/FontUtils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

export const StargateXVeBetterBannerClosable = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView testID="stargate-x-vebetter-closable-banner" style={styles.root}>
            <ImageBackground source={StargateBannerBackground} style={styles.container} resizeMode="cover">
                <BaseView alignItems={"flex-start"} gap={8} flex={1} justifyContent="center">
                    <StargateLogo />
                    <Markdown
                        style={{
                            paragraph: styles.paragraph,
                            body: styles.text,
                            // Android does not support fontWeight 600
                            ...(!isAndroid() && { strong: styles.bold }),
                        }}>
                        {LL.BANNER_STARGATE_X_VEBETTER_DESC()}
                    </Markdown>
                </BaseView>
                <Image source={StargateXVeBetterBannerB3MO} style={styles.image as ImageStyle} />
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
            width: 110,
            height: 110,
            position: "absolute",
            right: 20,
            top: 5,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 0,
        },
        text: {
            fontFamily: "Rubik",
            fontSize: FontUtils.font(14),
            color: "#EEF3F7",
            margin: 0,
        },
        bold: {
            fontWeight: "600",
        },
    })
