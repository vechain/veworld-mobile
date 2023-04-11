import React, { memo } from "react"
import { Image, StyleProp, ViewStyle } from "react-native"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { BaseText, BaseCard, BaseSpacer } from "~Components"
import { FungibleToken } from "~Model"

type Props = {
    token: FungibleToken
    containerStyle?: StyleProp<ViewStyle>
}

export const CustomTokenCard = memo(({ token, containerStyle }: Props) => {
    const theme = useTheme()
    return (
        <BaseCard containerStyle={[containerStyle]}>
            <BaseCard
                style={styles.imageContainer}
                containerStyle={styles.imageShadow}>
                <Image
                    source={{
                        uri: token.icon,
                    }}
                    style={styles.image}
                />
            </BaseCard>
            <BaseSpacer width={16} />
            <BaseText typographyFont="buttonPrimary" color={theme.colors.text}>
                {token.name}
            </BaseText>
        </BaseCard>
    )
})

const styles = StyleSheet.create({
    image: { width: 20, height: 20 },
    imageContainer: {
        borderRadius: 30,
        padding: 10,
    },
    imageShadow: {
        width: "auto",
    },
})
