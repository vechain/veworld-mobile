import React, {FC} from 'react'
import {ViewProps} from 'react-native'
import {useTheme} from '~Common'
import {VWView} from './VWView'

type Props = {
    height: number
    background?: string
} & ViewProps

export const VWSpacer: FC<Props> = (props: Props) => {
    const {style, ...otherProps} = props
    const theme = useTheme()
    return (
        <VWView
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
