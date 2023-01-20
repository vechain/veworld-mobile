import { Dimensions } from "react-native"
import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import VectorImage from "react-native-vector-image"
import { Slide } from "../Types"
import { Fonts } from "~Model"

type Props = {
    item: Slide
}

export const ListSlide = ({ item }: Props) => {
    return (
        <BaseView
            align="center"
            justify="flex-start"
            py={80}
            style={{ width: Dimensions.get("window").width }}>
            <VectorImage source={item.icon} />

            <BaseSpacer height={40} />

            <BaseView px={20}>
                <BaseText align="center" font={Fonts.sub_title}>
                    {item.title}
                </BaseText>
                <BaseSpacer height={20} />
                <BaseText align="center" font={Fonts.body}>
                    {item.text}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
