import React, { FC } from "react"
import { ViewProps } from "react-native"
import { useTheme } from "~Common"
import { BaseView } from "./BaseView"

type Props = {
    height?: number | string
    width?: number | string
    background?: string
} & ViewProps

export const BaseSpacer: FC<Props> = (props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()
    if (!props.height && !props.width) {
        throw new Error("BaseSpacer: height and width are not provided")
    }
    return (
        <BaseView
            style={[{ height: props.height, width: props.width }, style]}
            bg={props.background ? props.background : theme.colors.transparent}
            {...otherProps}
        />
    )
}
