import React, { FC, memo } from "react"
import { DimensionValue, ViewProps } from "react-native"
import { useTheme } from "~Hooks"
import { BaseView } from "./BaseView"
import { warn } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

type Props = {
    height?: DimensionValue
    width?: DimensionValue
    background?: string
} & ViewProps

export const BaseSpacer: FC<Props> = memo((props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()
    if (!props.height && !props.width) {
        warn(ERROR_EVENTS.UI, "BaseSpacer: height and width are not provided")
    }
    return (
        <BaseView
            style={[{ height: props.height, width: props.width }, style]}
            bg={props.background ? props.background : theme.colors.transparent}
            {...otherProps}
        />
    )
})
