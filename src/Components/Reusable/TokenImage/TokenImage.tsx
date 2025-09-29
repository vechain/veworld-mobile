import React, { useMemo } from "react"
import { Image, StyleSheet } from "react-native"
import { VeChainTokenBadge } from "~Assets/Icons"
import { BaseCustomTokenIcon, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
type Props = {
    testID?: string
    icon?: string
    symbol?: string
    isVechainToken?: boolean
    iconSize?: number
    isCrossChainToken?: boolean
    /**
     * Set to true if you want the icon always rounded (also for Vechain tokens)
     */
    rounded?: boolean
}

/**
 * Mapping between the image size and the crosschain size.
 * Keys should also be the only possible values for the size.
 */
const KNOWN_TOKEN_SIZES = {
    12: 6,
    16: 8,
    20: 8,
    24: 14,
    32: 16,
    40: 24,
    48: 24,
}

export const TokenImage = ({
    icon,
    symbol,
    isVechainToken = false,
    iconSize = 24,
    isCrossChainToken,
    testID,
    rounded,
}: Props) => {
    const crosschainImageStyle = useMemo(() => {
        //Use 14 as fallback since it's the old value
        const size = (KNOWN_TOKEN_SIZES as Record<number, number>)[iconSize] ?? 14
        return { width: size, height: size }
    }, [iconSize])
    if (isVechainToken) {
        if (rounded)
            return (
                <BaseView style={[styles.roundedImg]}>
                    <Image testID={testID} source={{ uri: icon }} height={iconSize} width={iconSize} />
                </BaseView>
            )
        return (
            <Image
                testID={testID}
                source={{ uri: icon }}
                height={iconSize}
                width={iconSize}
                style={rounded && styles.roundedImg}
            />
        )
    }

    return (
        <>
            {icon ? (
                <BaseView style={[styles.imageContainer, rounded && styles.roundedImg]}>
                    <Image testID={testID} source={{ uri: icon }} width={iconSize} height={iconSize} />
                    {isCrossChainToken && (
                        <Image source={VeChainTokenBadge} style={[styles.crossChainBadge, crosschainImageStyle]} />
                    )}
                </BaseView>
            ) : (
                <BaseView style={[styles.imageContainer, rounded && styles.roundedImg]}>
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
    roundedImg: {
        borderRadius: 30,
        overflow: "hidden",
    },
    crossChainBadge: { position: "absolute", right: -5, bottom: -5, width: 14, height: 14 },
})
