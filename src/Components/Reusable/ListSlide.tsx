import { Dimensions, StyleSheet } from "react-native"
import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Slide } from "~Model"

type Props = {
    item: Slide
}

export const ListSlide = ({ item }: Props) => {
    return (
        <BaseView align="center" justify="flex-start" style={baseStyles.view}>
            {item.icon}

            <BaseSpacer height={40} />

            <BaseView px={20}>
                <BaseText align="center" typographyFont="subTitle">
                    {item.title}
                </BaseText>
                <BaseSpacer height={20} />
                <BaseText align="center" typographyFont="body">
                    {item.text}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    view: {
        width: Dimensions.get("window").width,
        paddingTop: 80,
    },
})
