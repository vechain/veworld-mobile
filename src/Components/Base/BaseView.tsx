/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import {View, ViewProps} from 'react-native'
import {useTheme} from '~Common'

type Props = {
    w?: number
    h?: number
    background?: string
    orientation?: 'row' | 'column'
    justify?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    isFlex?: boolean
} & ViewProps

export const BaseView = (props: Props) => {
    const {style, ...otherProps} = props
    const theme = useTheme()

    return (
        <View
            style={[
                {
                    flex: props.isFlex ? 1 : 0,
                    flexDirection: props.orientation
                        ? props.orientation
                        : 'column',
                    justifyContent: props.justify ? props.justify : undefined,
                    alignItems: props.align ? props.align : undefined,
                    backgroundColor: props.background
                        ? props.background
                        : theme.constants.transparent,
                    width: props.w ? `${props.w}%` : undefined,
                    height: props.h ? `${props.h}%` : undefined,
                    margin: props.m && props.m,
                    marginVertical: props.mx && props.mx,
                    marginHorizontal: props.my && props.my,
                    padding: props.p && props.p,
                    paddingVertical: props.py && props.py,
                    paddingHorizontal: props.px && props.px,
                },
                style,
            ]}
            {...otherProps}
        />
    )
}
