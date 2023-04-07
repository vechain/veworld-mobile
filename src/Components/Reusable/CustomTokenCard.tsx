import React, { memo } from "react"
import { Image, StyleProp, ViewStyle } from "react-native"
import { StyleSheet } from "react-native"
import { BaseText, BaseCard, BaseSpacer } from "~Components"
import { FungibleToken } from "~Model"

type Props = {
    token: FungibleToken
    containerStyle?: StyleProp<ViewStyle>
}

export const CustomTokenCard = memo(({ token, containerStyle }: Props) => {
    return (
        <BaseCard containerStyle={[styles.card, containerStyle]}>
            {!!token.icon && (
                <>
                    <BaseCard style={styles.imageContainer}>
                        <Image
                            source={{
                                uri: token.icon,
                            }}
                            style={styles.image}
                        />
                    </BaseCard>
                    <BaseSpacer width={16} />
                </>
            )}
            <BaseText typographyFont="buttonPrimary">{token.name} </BaseText>
        </BaseCard>
    )
})

const styles = StyleSheet.create({
    image: { width: 20, height: 20 },
    imageContainer: {
        borderRadius: 30,
        padding: 10,
    },
    card: {
        width: "100%",
    },
})
