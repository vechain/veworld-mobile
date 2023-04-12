import React, { memo } from "react"
import { Image, StyleProp, ViewStyle } from "react-native"
import { StyleSheet } from "react-native"
import { PlaceholderSVG } from "~Assets"
import { COLORS } from "~Common/Theme"
import { BaseText, BaseCard, BaseSpacer, BaseView } from "~Components"
import { FungibleToken } from "~Model"

type Props = {
    token: FungibleToken
    containerStyle?: StyleProp<ViewStyle>
}

export const CustomTokenCard = memo(({ token, containerStyle }: Props) => {
    return (
        <BaseCard containerStyle={[containerStyle]}>
            <BaseCard
                style={[
                    styles.imageContainer,
                    { backgroundColor: COLORS.WHITE },
                ]}
                containerStyle={styles.imageShadow}>
                {token.icon ? (
                    <Image
                        source={{
                            uri: token.icon,
                        }}
                        style={styles.image}
                    />
                ) : (
                    <PlaceholderSVG />
                )}
            </BaseCard>
            <BaseSpacer width={16} />
            <BaseView flexDirection="column">
                <BaseText typographyFont="buttonPrimary">{token.name}</BaseText>
                <BaseText typographyFont="captionRegular">
                    {token.symbol}
                </BaseText>
            </BaseView>
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
