import React from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import Markdown from "react-native-markdown-display"
import { navigatorB3mo, VeBetterLogoGreenSVG, VeBetterSVG } from "~Assets"
import { BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import FontUtils from "~Utils/FontUtils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

export const VeBetterNavigatorsBanner = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={0.8}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
                    <VeBetterLogoGreenSVG color={theme.colors.veBetterNavigatorsBanner.vbdLogo.symbol} />
                    <VeBetterSVG color={theme.colors.veBetterNavigatorsBanner.vbdLogo.text} width={72} height={14} />
                </BaseView>
                <Markdown
                    style={{
                        paragraph: styles.paragraph,
                        body: styles.text,
                        // Android does not support fontWeight 600
                        ...(!isAndroid() && {
                            strong: { color: theme.colors.veBetterNavigatorsBanner.text, fontWeight: "600" },
                        }),
                    }}>
                    {LL.BANNER_VEBETTER_NAVIGATORS_DESC()}
                </Markdown>
            </BaseView>
            <FastImage source={navigatorB3mo} style={styles.image as ImageStyle} />
        </BaseView>
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
            backgroundImage: `linear-gradient(270deg, ${theme.colors.veBetterNavigatorsBanner.background.join(", ")})`,
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
            fontSize: FontUtils.font(13),
            color: theme.colors.veBetterNavigatorsBanner.text,
        },
    })
