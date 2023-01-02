/* eslint-disable react-native/no-inline-styles */
import React, {useMemo} from 'react'
import {Text, TextProps} from 'react-native'
import {TFonts, TWeight, useTheme} from '~Common'
import {BaseView} from './BaseView'
import {cumputeFontSize} from './Helpers/ComputeFontSize'

type Props = {
    weight?: TWeight
    font?: TFonts
    align?: 'left' | 'center' | 'right'
    italic?: boolean
    color?: string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
} & TextProps

export const BaseText = (props: Props) => {
    const {style, ...otherProps} = props
    const theme = useTheme()

    const cumputeFont = useMemo(
        () => cumputeFontSize(props.font, theme.typography),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.font],
    )

    return (
        <BaseView
            m={props.m ? props.m : undefined}
            mx={props.mx ? props.mx : undefined}
            my={props.my ? props.my : undefined}
            p={props.p ? props.p : undefined}
            px={props.px ? props.px : undefined}
            py={props.py ? props.py : undefined}>
            <Text
                style={[
                    {
                        color: props.color ? props.color : theme.colors.text,
                        fontWeight: props.weight ? props.weight : 'normal',
                        fontSize: cumputeFont,
                        textAlign: props.align,
                        fontStyle: props.italic ? 'italic' : 'normal',
                    },
                    style,
                ]}
                {...otherProps}
            />
        </BaseView>
    )
}
