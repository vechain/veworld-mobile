import React from "react"
import { Image, StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { BaseCustomTokenIcon, BaseView } from "~Components/Base"

type Props = {
    icon?: string
    symbol?: string
    isLogoRound?: boolean
}

export const TokenImage = ({ icon, symbol, isLogoRound = false }: Props) => {
    if (isLogoRound) {
        return <Image source={{ uri: icon }} height={26} width={26} />
    }

    return (
        <>
            {icon ? (
                <BaseView style={[styles.imageContainer]}>
                    <Image source={{ uri: icon }} style={styles.image} />
                </BaseView>
            ) : (
                <BaseCustomTokenIcon style={styles.icon} tokenSymbol={symbol ?? ""} />
            )}
        </>
    )
}
const styles = StyleSheet.create({
    imageShadow: {
        width: "auto",
    },
    icon: {
        width: 16,
        height: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        borderRadius: 30,
        padding: 5,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 16, height: 16 },
})
