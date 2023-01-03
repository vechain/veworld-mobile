/* eslint-disable react-native/no-inline-styles */
import React, {useMemo} from 'react'
import {Text, TextProps} from 'react-native'
import {TFonts, TWeight, useTheme} from '~Common'
import {BaseView} from './BaseView'
import {cumputeFontSize} from './Helpers/ComputeFontSize'
import {computeTextColor} from './Helpers/ComputeTextColor'

type Props = {
    weight?: TWeight
    font?: TFonts
    align?: 'left' | 'center' | 'right'
    italic?: boolean
    color?: string
    isButton?: boolean
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

    const computeColor = useMemo(
        () =>
            computeTextColor(
                props.isButton,
                props.color,
                theme.colors.text,
                theme.colors.button,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.color, props.isButton, theme.isDark],
    )

    return (
        <BaseView
            m={props.m}
            mx={props.mx}
            my={props.my}
            p={props.p}
            px={props.px}
            py={props.py}>
            <Text
                style={[
                    {
                        color: computeColor,
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
