import React, { memo, useState } from "react"
import { FlatList, StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { useThemedStyles } from "~Common"
import { BaseSpacer } from "~Components"
import { ThemeType } from "~Model"
import { NftCard } from "./temp"

interface Props extends AnimateProps<ViewProps> {}

export const NFTList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState(
        [...new Array(160).keys()].map(value => `nft${value}`),
    )
    const { styles } = useThemedStyles(baseStyles)

    return (
        <Animated.View style={styles.view} {...animatedViewProps}>
            <FlatList
                data={data}
                numColumns={1}
                horizontal={false}
                renderItem={({ item }) => <NftCard value={item} />}
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <BaseSpacer height={10} />}
                keyExtractor={item => item}
            />
        </Animated.View>
    )
})

const baseStyles = (theme: ThemeType) =>
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
