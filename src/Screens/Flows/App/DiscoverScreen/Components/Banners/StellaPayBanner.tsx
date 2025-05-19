import React from "react"
import { Image, StyleSheet, ImageStyle, Text } from "react-native"
import { BaseView, BaseText, WrapTranslation } from "~Components"
import { StellaPayBannerB3MO, StellaPayLogoSVG } from "~Assets"
import { useThemedStyles } from "~Hooks"
import LinearGradient from "react-native-linear-gradient"
import { useI18nContext } from "~i18n"

export const StellaPayBanner = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <LinearGradient
            colors={theme.colors.stellaPayBanner.background}
            angle={90}
            start={{ x: 0.32, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={1} justifyContent="center">
                <StellaPayLogoSVG />
                <BaseText fontFamily="Rubik-Regular" color={"#EEF3F7"} numberOfLines={2}>
                    <WrapTranslation
                        message={LL.BANNER_STELLAPAY_DESC()}
                        renderComponent={text => (
                            <Text numberOfLines={2} style={styles.text}>
                                <Text style={styles.textBold}>{"VeBetter credit card"}</Text>
                                <Text style={styles.text}>{text}</Text>
                                <Text style={styles.textBold}>{"Stella pay!"}</Text>
                            </Text>
                        )}
                    />
                </BaseText>
            </BaseView>
            <Image source={StellaPayBannerB3MO} style={styles.image as ImageStyle} />
        </LinearGradient>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            minHeight: 108,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingRight: 140,
        },
        image: {
            width: 123,
            height: 123,
            position: "absolute",
            right: -9,
            top: 8,
        },
        textBold: {
            fontFamily: "Rubik-SemiBold",
            fontSize: 14,
            color: "#EEF3F7",
        },
        text: {
            fontFamily: "Rubik-Regular",
            fontSize: 14,
        },
    })
