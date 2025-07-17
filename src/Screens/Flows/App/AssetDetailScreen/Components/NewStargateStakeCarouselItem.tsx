import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Image, ImageStyle, StyleSheet, TouchableOpacity } from "react-native"
import { StargateBigLogo } from "~Assets/Img/StargateBigLogo"
import { BaseCard, BaseIcon, BaseText } from "~Components"
import { COLORS, ColorThemeType, STARGATE_DAPP_URL } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const NewStargateStakeCarouselItem = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const { navigateWithTab } = useBrowserTab()

    const onOpenNewStake = useCallback(() => {
        navigateWithTab({
            url: `${STARGATE_DAPP_URL}/stake`,
            title: "Stargate Stake",
            navigationFn(u) {
                nav.navigate(Routes.BROWSER, { url: u, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    return (
        <BaseCard containerStyle={styles.root} style={styles.rootContent}>
            <Image source={{ uri: StargateBigLogo }} style={styles.image as ImageStyle} />
            <TouchableOpacity style={styles.buttonStyle} onPress={onOpenNewStake}>
                <BaseIcon size={32} name="icon-plus" color={theme.colors.assetDetailsCard.title} />
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
                    {LL.STARGATE_NEW_STAKE()}
                </BaseText>
            </TouchableOpacity>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderRadius: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
            borderWidth: 1,
            minWidth: 240,
            height: "100%",
        },
        rootContent: {
            padding: 16,
            flexDirection: "column",
            gap: 12,
            height: "100%",
        },
        image: {
            width: 208,
            height: 160,
            borderRadius: 8,
        },
        buttonStyle: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexGrow: 1,
        },
    })
