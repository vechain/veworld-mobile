import { Dimensions } from "react-native"
import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import VectorImage from "react-native-vector-image"
import { Slide } from "../Types"

type Props = {
    item: Slide
}

export const ListSlide = ({ item }: Props) => {
    return (
        <BaseView
            alignItems="center"
            justifyContent="flex-start"
            py={80}
            style={{ width: Dimensions.get("window").width }}>
            <VectorImage source={item.icon} />

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
