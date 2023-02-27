import React, { memo, useState } from "react"
import { ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Fonts } from "~Model"

interface Props extends AnimateProps<ViewProps> {}

export const CoinList = memo(({ ...animatedViewProps }: Props) => {
    const [data] = useState([...new Array(80).keys()])

    return (
        <Animated.View
            style={{
                width: "100%",
                paddingHorizontal: 20,
            }}
            {...animatedViewProps}>
            {data.map(item => (
                <BaseView key={item}>
                    <BaseTouchableBox action={() => console.log(item)}>
                        <BaseText font={Fonts.sub_title}>{item}</BaseText>
                    </BaseTouchableBox>
                    <BaseSpacer height={10} />
                </BaseView>
            ))}
        </Animated.View>
    )
})
