import React from "react"
import { Image, StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { BaseCustomTokenIcon, BaseView } from "~Components/Base"
import { VeChainTokenBadge } from "~Assets/Icons"
type Props = {
    testID?: string
    icon?: string
    symbol?: string
    isVechainToken?: boolean
    iconSize?: number
    isCrossChainToken?: boolean
}

export const TokenImage = ({
    icon,
    symbol,
    isVechainToken = false,
    iconSize = 24,
    isCrossChainToken,
    testID,
}: Props) => {
    if (isVechainToken) {
        return <Image testID={testID} source={{ uri: icon }} height={iconSize} width={iconSize} />
    }

    return (
        <>
            {icon ? (
                <BaseView style={[styles.imageContainer]}>
                    <Image testID={testID} source={{ uri: icon }} width={iconSize} height={iconSize} />
                    {isCrossChainToken && <Image source={VeChainTokenBadge} style={styles.crossChainBadge} />}
                </BaseView>
            ) : (
                <BaseView style={[styles.imageContainer]}>
                    <BaseCustomTokenIcon testID={testID} style={styles.icon} tokenSymbol={symbol ?? ""} />
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
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        borderRadius: 30,
        backgroundColor: COLORS.GREY_50,
    },
    crossChainBadge: { position: "absolute", right: -5, bottom: -5, width: 14, height: 14 },
})
