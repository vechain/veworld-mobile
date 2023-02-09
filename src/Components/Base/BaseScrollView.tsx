import React, { FC } from "react"
import { ScrollView, ScrollViewProps } from "react-native"
import { useTheme } from "~Common"

type Props = {
    grow?: number
} & ScrollViewProps

export const BaseScrollView: FC<Props> = props => {
    const { style, ...otherProps } = props
    const theme = useTheme()

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: props.grow }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={[{ backgroundColor: theme.colors.background }, style]}
            {...otherProps}
        />
    )
}
