import React, {FC} from 'react'
import {ViewProps} from 'react-native'
import {useTheme} from '~Common'
import {BaseView} from './BaseView'

type Props = {
    height: number
    background?: string
} & ViewProps

export const BaseSpacer: FC<Props> = (props: Props) => {
    const {style, ...otherProps} = props
    const theme = useTheme()
    return (
        <BaseView
            style={[{height: props.height}, style]}
            background={
                props.background
                    ? props.background
                    : theme.constants.transparent
            }
            {...otherProps}
        />
    )
}
