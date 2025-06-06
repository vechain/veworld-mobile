import { Dimensions, StyleSheet } from "react-native"
import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Slide } from "~Model"

type Props = {
    item: Slide
}

export const ListSlide = ({ item }: Props) => {
    return (
        <BaseView alignItems="center" justifyContent="flex-start" style={baseStyles.view}>
            {item.icon}

            <BaseSpacer height={24} />

            <BaseView px={20}>
                <BaseText align="center" typographyFont="subTitleBold">
                    {item.title}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">{item.text}</BaseText>
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
