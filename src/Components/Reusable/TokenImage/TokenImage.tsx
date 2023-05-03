import React from "react"
import { StyleSheet } from "react-native"
import { PlaceholderSVG } from "~Assets"
import { COLORS } from "~Common/Theme"
import { BaseCard, BaseImage } from "~Components/Base"

type Props = {
    icon?: string
}

export const TokenImage = ({ icon }: Props) => {
    return (
        <BaseCard
            style={[styles.imageContainer, { backgroundColor: COLORS.WHITE }]}
            containerStyle={styles.imageShadow}>
            {icon ? (
                <BaseImage uri={icon} style={styles.image} />
            ) : (
                <PlaceholderSVG />
            )}
        </BaseCard>
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
    image: { width: 20, height: 20 },
})
