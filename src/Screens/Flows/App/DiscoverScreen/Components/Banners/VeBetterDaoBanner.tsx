import React from "react"
import { StyleSheet, Image, ImageStyle, Text } from "react-native"
import { VeBetterDaoBannerB3MO, VeBetterLogoGreenSVG, VeBetterSVG } from "~Assets"
import { BaseView, BaseText, WrapTranslation } from "~Components"
import { useThemedStyles } from "~Hooks"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"

export const VeBetterDaoBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView flexDirection="row" borderRadius={12} px={16} py={12} bg={"#002234"} style={styles.container}>
            <BaseView alignItems={"flex-start"} gap={16} flex={0.7} flexWrap="wrap">
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
                    <VeBetterLogoGreenSVG />
                    <VeBetterSVG color={COLORS.WHITE} width={72} height={14} />
                </BaseView>
                <BaseText color={"#EEF3F7"} numberOfLines={2} fontSize={14} fontFamily="Rubik-Regular">
                    <WrapTranslation
                        message={LL.BANNER_VEBETTER_DESC()}
                        renderComponent={text => (
                            <Text numberOfLines={2} style={styles.text}>
                                <Text style={styles.textBold}>{"VeBetterDAO"}</Text>
                                <Text style={styles.text}>{text}</Text>
                            </Text>
                        )}
                    />
                </BaseText>
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
        text: {
            fontFamily: "Rubik-Regular",
            fontSize: 14,
            color: "#EEF3F7",
        },
        textBold: {
            fontFamily: "Rubik-Bold",
            fontSize: 14,
            color: "#B1F16C",
        },
    })
