import React, { useCallback } from "react"
import { Image, StyleSheet, ImageStyle, ImageBackground, Pressable } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { StargateB3MO, StargateBannerBackground, StargateLogo } from "~Assets"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import Markdown from "react-native-markdown-display"
import { useAppDispatch } from "~Storage/Redux/Hooks"
import { setHideStargateBannerHomeScreen, setHideStargateBannerVETScreen } from "~Storage/Redux"

type Props = {
    location: "home_screen" | "token_screen"
}

export const StargateBannerClosable = ({ location }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const onClose = useCallback(() => {
        if (location === "home_screen") {
            dispatch(setHideStargateBannerHomeScreen(true))
        } else if (location === "token_screen") {
            dispatch(setHideStargateBannerVETScreen(true))
        }
    }, [dispatch, location])

    return (
        <BaseView style={styles.root}>
            <ImageBackground source={StargateBannerBackground} style={styles.container}>
                <BaseView alignItems={"flex-start"} gap={8} flex={1} justifyContent="center">
                    <StargateLogo />
                    <Markdown style={{ paragraph: styles.paragraph, body: styles.text }}>
                        {LL.BANNER_STARGATE_DESC()}
                    </Markdown>
                </BaseView>
                <Image source={StargateB3MO} style={styles.image as ImageStyle} />
            </ImageBackground>
            <Pressable style={styles.closeButton} onPress={onClose} testID="Stargate_banner_close_button">
                <BaseIcon name="icon-x" size={16} color={"white"} />
            </Pressable>
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
            width: 114,
            height: 114,
            position: "absolute",
            right: 25,
            top: -5,
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
        closeButton: {
            position: "absolute",
            right: 6,
            top: 6,
            width: 24,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4,
        },
    })
