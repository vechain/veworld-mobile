import React, { useCallback } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseText, BaseTouchableBox } from "~Components"
import { useTheme } from "~Common"

type Props = AnimateProps<ViewProps> & {
    value: string
}
export const NftCard: React.FC<Props> = ({ value, ...animatedViewProps }) => {
    const onAction = useCallback(() => console.log(value), [value])

    const theme = useTheme()

    return (
        <Animated.View style={baseStyles.view} {...animatedViewProps}>
            <BaseTouchableBox action={onAction} bg={theme.colors.primary}>
                <BaseText
                    color={theme.colors.primaryReversed}
                    typographyFont="subTitle">
                    {value}
                </BaseText>
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
