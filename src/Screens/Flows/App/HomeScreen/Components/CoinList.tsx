import React, { useState } from "react"
import { ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

interface Props extends AnimateProps<ViewProps> {}

export const CoinList = ({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(80).keys()])
    const theme = useTheme()

    return (
        <Animated.View
            style={{
                width: "100%",
                paddingHorizontal: 20,
                backgroundColor: theme.colors.background,
            }}
            {...animatedViewProps}>
            {data.map(item => (
                <BaseView key={item} background="lime" my={10}>
                    <BaseText font={Fonts.sub_title}>{item}</BaseText>
                </BaseView>
            ))}
        </Animated.View>
    )
}
