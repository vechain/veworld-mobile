import React, { memo, useState } from "react"
import { ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

interface Props extends AnimateProps<ViewProps> {}

export const NFTList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(2).keys()])
    const theme = useTheme()

    return (
        <Animated.View
            style={{
                width: "100%",
                paddingHorizontal: 20,
                flexWrap: "wrap",
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: theme.colors.background,
            }}
            {...animatedViewProps}>
            {data.map(item => (
                <BaseView
                    key={item}
                    background="pink"
                    m={10}
                    w={33}
                    style={{ height: 80 }}>
                    <BaseText font={Fonts.sub_title}>{item}</BaseText>
                </BaseView>
            ))}
        </Animated.View>
    )
})
