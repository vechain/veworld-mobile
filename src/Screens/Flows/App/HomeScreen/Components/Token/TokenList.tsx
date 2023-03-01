import React, { memo, useCallback, useState } from "react"
import { FlatList, StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { TokenCard } from "./TokenCard"

interface Props extends AnimateProps<ViewProps> {}

export const TokenList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(80).keys()])

    const renderItem = useCallback(
        ({ item }: { item: number }) => <TokenCard value={item} />,
        [],
    )
    const renderSeparator = useCallback(() => <BaseSpacer height={10} />, [])

    return (
        <Animated.View style={baseStyles.view} {...animatedViewProps}>
            <FlatList
                data={data}
                renderItem={renderItem}
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={renderSeparator}
                keyExtractor={item => `${item}`}
            />
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    view: {
        width: "100%",
        paddingHorizontal: 20,
    },
})
