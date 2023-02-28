import React, { memo, useState } from "react"
import { FlatList, StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { TokenCard } from "./TokenCard"

interface Props extends AnimateProps<ViewProps> {}

export const TokenList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(80).keys()])

    return (
        <Animated.View style={baseStyles.view} {...animatedViewProps}>
            <FlatList
                data={data}
                renderItem={({ item }) => <TokenCard value={item} />}
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <BaseSpacer height={10} />}
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
