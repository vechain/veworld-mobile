import React from "react"
import { StyleSheet, Image, ImageStyle } from "react-native"
import { VeBetterDaoBannerB3MO } from "~Assets"
import { BaseView, BaseText } from "~Components"
import { useThemedStyles } from "~Hooks"

export const VeBetterDaoBanner = () => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView flexDirection="row" borderRadius={12} px={16} py={12} bg={"#002234"} style={styles.container}>
            <BaseView alignItems={"center"} gap={16}>
                <BaseText>{"VeBetterDaoBanner"}</BaseText>
                <BaseText>{"Explore the VeBetterDAO platform"}</BaseText>
            </BaseView>
            <Image source={VeBetterDaoBannerB3MO} style={styles.image as ImageStyle} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            minHeight: 108,
        },
        image: {
            width: 100,
            height: 100,
            position: "absolute",
            right: 0,
            bottom: 0,
        },
    })
