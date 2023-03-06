import React, { memo, useState } from "react"
import { StyleSheet } from "react-native"
import { FlatList, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"

const NUM_ITEMS = 20
function getColor(i: number) {
    const multiplier = 255 / (NUM_ITEMS - 1)
    const colorVal = i * multiplier
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`
}

export type Item = {
    key: string
    label: string
    height: number
    width: number
    backgroundColor: string
}

const initialData: Item[] = [...Array(NUM_ITEMS)].map((d, index) => {
    const backgroundColor = getColor(index)
    return {
        key: `item-${index}`,
        label: String(index) + "",
        height: 100,
        width: 60 + Math.random() * 40,
        backgroundColor,
    }
})

interface Props extends AnimateProps<ViewProps> {}

export const NFTList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState(initialData)

    const { styles } = useThemedStyles(baseStyles)

    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <FlatList
                data={data}
                keyExtractor={item => item.key}
                renderItem={({ item }) => {
                    return (
                        <BaseView
                            style={{
                                width: 100,
                                height: 100,
                                backgroundColor: "pink",
                                margin: 10,
                            }}>
                            <BaseText>{item.label}</BaseText>
                        </BaseView>
                    )
                }}
                showsVerticalScrollIndicator={false}
            />
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: theme.colors.background,
        },
    })
