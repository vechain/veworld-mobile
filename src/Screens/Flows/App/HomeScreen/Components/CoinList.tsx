import React, { memo, useState } from "react"
import { FlatList, StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseTouchableBox } from "~Components"
import { Fonts } from "~Model"

interface Props extends AnimateProps<ViewProps> {}

export const CoinList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(80).keys()])

    return (
        <Animated.View style={baseStyles.view} {...animatedViewProps}>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <BaseTouchableBox action={() => console.log(item)}>
                        <BaseText font={Fonts.sub_title}>{item}</BaseText>
                    </BaseTouchableBox>
                )}
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
