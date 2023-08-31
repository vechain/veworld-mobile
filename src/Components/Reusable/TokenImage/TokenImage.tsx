import React from "react"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { BaseCard, BaseCustomTokenIcon, BaseImage } from "~Components/Base"
import { address } from "thor-devkit"

type Props = {
    height: number
    width: number
    icon?: string
    tokenAddress?: string
    symbol?: string
}

export const TokenImage = ({
    height,
    width,
    icon,
    tokenAddress,
    symbol,
}: Props) => {
    return (
        <>
            {icon ? (
                <BaseCard
                    style={[
                        styles.imageContainer,
                        { backgroundColor: COLORS.WHITE },
                    ]}
                    containerStyle={styles.imageShadow}>
                    <BaseImage
                        uri={icon}
                        style={{ height: height, width: width }}
                    />
                </BaseCard>
            ) : (
                <BaseCustomTokenIcon
                    style={styles.icon}
                    tokenAddress={address.toChecksumed(tokenAddress ?? "")}
                    tokenSymbol={symbol ?? ""}
                />
            )}
        </>
    )
}
const styles = StyleSheet.create({
    imageShadow: {
        width: "auto",
    },
    imageContainer: {
        borderRadius: 30,
        padding: 10,
    },
    icon: {
        width: 38,
        height: 38,
        borderRadius: 38 / 2,
        alignItems: "center",
        justifyContent: "center",
    },
})
