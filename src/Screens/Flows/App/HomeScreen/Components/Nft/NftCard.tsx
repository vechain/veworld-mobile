import React, { useCallback } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseText, BaseTouchableBox } from "~Components"
import { Fonts } from "~Model"

type Props = AnimateProps<ViewProps> & {
    value: string
}
export const NftCard: React.FC<Props> = ({ value, ...animatedViewProps }) => {
    const onAction = useCallback(() => console.log(value), [value])

    return (
        <Animated.View style={baseStyles.view} {...animatedViewProps}>
            <BaseTouchableBox action={onAction}>
                <BaseText font={Fonts.sub_title}>{value}</BaseText>
            </BaseTouchableBox>
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    view: {
        width: "100%",
        paddingHorizontal: 20,
    },
})
