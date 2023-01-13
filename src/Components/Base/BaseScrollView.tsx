/* eslint-disable react-native/no-inline-styles */
import React, { FC } from "react"
import { ScrollView, ScrollViewProps } from "react-native"
import { useTheme } from "~Common"

type Props = {
    flexGrow?: boolean
} & ScrollViewProps

export const BaseScrollView: FC<Props> = props => {
    const { style, ...otherProps } = props
    const theme = useTheme()

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: props.flexGrow ? 1 : 0 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={[{ backgroundColor: theme.colors.background }, style]}
            {...otherProps}
        />
    )
}
