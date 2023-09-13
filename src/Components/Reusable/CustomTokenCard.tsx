import React, { memo } from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import {
    BaseText,
    BaseCard,
    BaseSpacer,
    BaseView,
    BaseCustomTokenIcon,
    BaseImage,
} from "~Components"
import { FungibleToken } from "~Model"
import { address } from "thor-devkit"

type Props = {
    token: FungibleToken
    containerStyle?: StyleProp<ViewStyle>
}

export const CustomTokenCard = memo(({ token, containerStyle }: Props) => {
    const hasIcon = Boolean(token.icon)

    return (
        <BaseCard containerStyle={containerStyle}>
            {hasIcon && (
                <BaseCard
                    style={[
                        styles.imageContainer,
                        {
                            backgroundColor: COLORS.WHITE,
                        },
                    ]}
                    containerStyle={styles.imageShadow}>
                    <BaseImage
                        source={{ uri: token.icon }}
                        style={styles.image}
                    />
                </BaseCard>
            )}
            {!hasIcon && (
                <BaseCustomTokenIcon
                    style={styles.icon}
                    tokenSymbol={token.symbol}
                    tokenAddress={address.toChecksumed(token.address)}
                />
            )}
            <BaseSpacer width={8} />
            <BaseView flexDirection="column" justifyContent="center" w={75}>
                <BaseText
                    typographyFont="buttonPrimary"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {token.name}
                </BaseText>
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
    icon: {
        width: 38,
        height: 38,
        borderRadius: 38 / 2,
        alignItems: "center",
        justifyContent: "center",
    },
})
