import React, { memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseView } from "~Components"
import { NFTItem } from "../NFTScreen"
import { CollectionAccordion } from "./CollectionAccordion"

const NUM_ITEMS = 20
function getColor(i: number) {
    const multiplier = 255 / (NUM_ITEMS - 1)
    const colorVal = i * multiplier
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`
}

const initialData: NFTItem[] = [...Array(NUM_ITEMS)].map((d, index) => {
    const backgroundColor = getColor(index)
    return {
        key: `item-${index}`,
        label: String(index) + "",
        height: 100,
        width: 60 + Math.random() * 40,
        backgroundColor,
    }
})

const ARRAY_LIST = [
    { title: "Not Boored Apes", list: initialData },
    { title: "Erik's Adventures", list: initialData },
    { title: "Daje Roma", list: initialData },
    { title: "Pokemon", list: initialData },
]

interface Props extends AnimateProps<ViewProps> {}

export const CollectionsList = memo(({ ...animatedViewProps }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)

    return (
        <Animated.View style={themedStyles.container} {...animatedViewProps}>
            {ARRAY_LIST.map((data, index) => (
                <BaseView key={index} style={themedStyles.innerContainer}>
                    <CollectionAccordion collection={data} />
                </BaseView>
            ))}
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: theme.colors.background,
        },
        innerContainer: { paddingVertical: 12 },
    })
