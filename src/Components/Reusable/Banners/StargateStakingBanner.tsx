import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Image, ImageBackground, ImageStyle, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import Markdown from "react-native-markdown-display"
import { StargateDappBannerB3MO, StargateDappLogo } from "~Assets"
import { BaseView } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const StargateStakingBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { navigateWithTab } = useBrowserTab()
    const nav = useNavigation()
    const track = useAnalyticTracking()

    const handlePress = () => {
        navigateWithTab({
            url: STARGATE_DAPP_URL,
            title: "Stargate",
            navigationFn: (url: string) => {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location: "staking" })
                nav.navigate(Routes.BROWSER, { url })
            },
        })
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.container}>
            <BaseView flex={0.5} flexDirection="row" alignItems="center" gap={12}>
                <Image source={StargateDappLogo} style={styles.logo as ImageStyle} />
                <Markdown style={{ paragraph: styles.paragraph, body: styles.text }}>
                    {LL.BANNER_STARGATE_DESC()}
                </Markdown>
            </BaseView>
            <ImageBackground
                source={StargateDappBannerB3MO}
                resizeMode="contain"
                resizeMethod="scale"
                style={styles.backgroundImg}
            />
        </TouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_50,
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
        },
        backgroundImg: {
            width: 106,
            height: 106,
            position: "absolute",
            right: 0,
            top: 2,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 0,
        },
        text: {
            fontFamily: "Rubik",
            fontSize: 14,
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800,
            margin: 0,
        },
        logo: {
            width: 48,
            height: 48,
            borderRadius: 12,
        },
        banner: {
            width: 106,
            height: 106,
        },
    })
