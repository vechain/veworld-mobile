import React from "react"
import { Image, StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { BaseCustomTokenIcon, BaseView } from "~Components/Base"

type Props = {
    icon?: string
    symbol?: string
    isVechainToken?: boolean
    iconSize?: number
}

export const TokenImage = ({ icon, symbol, isVechainToken = false, iconSize = 24 }: Props) => {
    if (isVechainToken) {
        return <Image source={{ uri: icon }} height={iconSize} width={iconSize} />
    }

    return (
        <>
            {icon ? (
                <BaseView style={[styles.imageContainer]}>
                    <Image source={{ uri: icon }} style={styles.image} />
                </BaseView>
            ) : (
                <BaseView style={[styles.imageContainer]}>
                    <BaseCustomTokenIcon style={styles.icon} tokenSymbol={symbol ?? ""} />
                </BaseView>
            )}
        </>
    )
}
const styles = StyleSheet.create({
    imageShadow: {
        width: "auto",
    },
    icon: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        borderRadius: 30,
        padding: 4,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 18, height: 18 },
})
