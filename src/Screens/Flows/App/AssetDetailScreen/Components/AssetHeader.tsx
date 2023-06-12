import { StyleSheet } from "react-native"
import React from "react"
import { BaseCard, BaseImage, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"

type Props = {
    name: string
    symbol: string
    icon: string
}

export const AssetHeader = ({ name, symbol, icon }: Props) => {
    return (
        <BaseView flexDirection="row">
            <BaseCard
                style={[baseStyles.card, { backgroundColor: COLORS.WHITE }]}
                containerStyle={baseStyles.imageShadow}>
                <BaseImage uri={icon} w={20} h={20} />
            </BaseCard>

            <BaseView>
                <BaseText typographyFont="title">{name}</BaseText>
                <BaseText typographyFont="body">{symbol}</BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    imageShadow: {
        width: "auto",
    },
    card: {
        borderRadius: 30,
        padding: 10,
        marginEnd: 16,
    },
})
