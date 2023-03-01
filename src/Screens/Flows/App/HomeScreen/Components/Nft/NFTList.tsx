import React, { memo, useCallback, useState } from "react"
import { FlatList, StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseSpacer } from "~Components"
import { NftCard } from "./NFTCard"

interface Props extends AnimateProps<ViewProps> {}

export const NFTList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState(
        [...new Array(160).keys()].map(value => `nft${value}`),
    )
    const { styles } = useThemedStyles(baseStyles)

    const renderItem = useCallback(
        ({ item }: { item: string }) => <NftCard value={item} />,
        [],
    )
    const renderSeparator = useCallback(() => <BaseSpacer height={10} />, [])
    return (
        <Animated.View style={styles.view} {...animatedViewProps}>
            <FlatList
                data={data}
                numColumns={1}
                horizontal={false}
                renderItem={renderItem}
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={renderSeparator}
                keyExtractor={item => item}
            />
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        view: {
            width: "100%",
            paddingHorizontal: 20,
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: theme.colors.background,
        },
    })
