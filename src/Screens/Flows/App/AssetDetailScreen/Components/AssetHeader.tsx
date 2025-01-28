import { StyleSheet } from "react-native"
import React from "react"
import { BaseImage, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"

type Props = {
    name: string
    symbol: string
    icon: string
}

export const AssetHeader = ({ name, symbol, icon }: Props) => {
    return (
        <BaseView flexDirection="row">
            <BaseView style={[baseStyles.card, { backgroundColor: COLORS.WHITE }]}>
                <BaseImage uri={icon} style={baseStyles.icon} />
            </BaseView>
            <BaseSpacer width={16} />
            <BaseView>
                <BaseText typographyFont="title">{name}</BaseText>
                <BaseText typographyFont="body">{symbol}</BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    icon: {
        width: 20,
        height: 20,
    },
    imageShadow: {
        width: "auto",
    },
    card: {
        borderRadius: 30,
        padding: 10,
    },
})
