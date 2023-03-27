import React, { FC } from "react"
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from "react-native"
import { useTheme } from "~Common"
import { BaseView } from "./BaseView"

type Props = {
    h?: string | number
    w?: string | number
    containerStyle?: StyleProp<ViewStyle>
} & ScrollViewProps

/**
 * NOTE: the wrapper view is needed because you can't set height to a scrollView directly
 * reference: https://stackoverflow.com/questions/49373417/react-native-scrollview-height-always-stays-static-and-does-not-change
 */

export const BaseScrollView: FC<Props> = props => {
    const { h, w, style, containerStyle, ...otherProps } = props
    const theme = useTheme()

    return (
        <BaseView h={h} w={w} style={containerStyle}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                style={[{ backgroundColor: theme.colors.background }, style]}
                {...otherProps}
            />
        </BaseView>
    )
}
