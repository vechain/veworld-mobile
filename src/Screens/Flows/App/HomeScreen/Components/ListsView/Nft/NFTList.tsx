import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { NFTAccordion } from "./NFTAccordion"
import { FlashList } from "@shopify/flash-list"
import DropShadow from "react-native-drop-shadow"

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

const ARRAY_LIST = [
    { title: "Not Boored Apes", list: initialData },
    { title: "Erik's Adventures", list: initialData },
    { title: "Daje Roma", list: initialData },
    { title: "Pokemon", list: initialData },
]

interface Props extends AnimateProps<ViewProps> {}

export const NFTList = memo(({ ...animatedViewProps }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const renderSeparator = useCallback(
        () => <BaseView style={{ width: 16 }} />,
        [],
    )

    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            {ARRAY_LIST.map((data, index) => (
                <BaseView key={index} py={12}>
                    <NFTAccordion
                        headerComponent={
                            <BaseView
                                flexDirection="row"
                                alignItems="center"
                                px={20}>
                                <BaseView style={styles.nftPreviewImage} />
                                <BaseText typographyFont="subTitle">
                                    {data.title}
                                </BaseText>
                            </BaseView>
                        }
                        bodyComponent={
                            <BaseView w={100} style={{ height: 184 }}>
                                <FlashList
                                    data={data.list}
                                    keyExtractor={item => item.key}
                                    ItemSeparatorComponent={renderSeparator}
                                    contentContainerStyle={styles.listContainer}
                                    renderItem={({ item }) => {
                                        return (
                                            <DropShadow
                                                style={styles.cardShadow}>
                                                <BaseView
                                                    style={[
                                                        styles.nftCard,
                                                        {
                                                            backgroundColor:
                                                                item.backgroundColor,
                                                        },
                                                    ]}>
                                                    <BaseText>
                                                        {item.label}
                                                    </BaseText>
                                                </BaseView>
                                            </DropShadow>
                                        )
                                    }}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    horizontal
                                    estimatedItemSize={152}
                                    estimatedListSize={{
                                        height: 184,
                                        width:
                                            152 * NUM_ITEMS +
                                            (NUM_ITEMS - 1) * 16,
                                    }}
                                />
                            </BaseView>
                        }
                    />
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
        listContainer: {
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        nftCard: {
            width: 152,
            height: 152,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
        },

        nftPreviewImage: {
            width: 32,
            height: 32,
            backgroundColor: "pink",
            borderRadius: 16,
            marginRight: 10,
        },

        cardShadow: theme.shadows.nftCard,
    })
