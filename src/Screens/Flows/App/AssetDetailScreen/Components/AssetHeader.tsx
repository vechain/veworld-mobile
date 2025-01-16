import { Image, StyleSheet } from "react-native"
import React from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useNavigation } from "@react-navigation/native"

type Props = {
    name: string
    symbol: string
    icon: string
}

export const AssetHeader = ({ name, symbol, icon }: Props) => {
    const theme = useTheme()
    const nav = useNavigation()

    return (
        <BaseView style={baseStyles.headerContainer} flexDirection="row" w={100} justifyContent="space-between">
            <BaseIcon haptics="Light" size={24} name="icon-arrow-left" color={theme.colors.text} action={nav.goBack} />
            <BaseView style={[baseStyles.imageContainer]}>
                <Image source={{ uri: icon }} style={baseStyles.image} />
            </BaseView>
            <BaseSpacer width={24} />
            <BaseView style={baseStyles.rightElementContainer}>
                {
                    <BaseView alignItems="flex-end">
                        <BaseText typographyFont="subSubTitleSemiBold">{name}</BaseText>
                        <BaseText typographyFont="captionRegular">{symbol}</BaseText>
                    </BaseView>
                }
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        padding: 9,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 14, height: 14 },
    rightElementContainer: {
        position: "absolute",
        right: 0,
        top: -6,
    },
    headerContainer: {
        height: 32,
    },
    assetDetailsHeader: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
})
