/* eslint-disable react-native/no-inline-styles */
import {
    TouchableOpacity,
    TouchableOpacityProps,
    TouchableHighlightProps,
    StyleSheet,
} from 'react-native'
import React from 'react'
import {useTheme} from '~Common'

type PlatformButton = TouchableOpacityProps | TouchableHighlightProps

type Props = {
    action: () => void
    disabled?: boolean
    children: React.ReactNode
    background?: string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    w?: number
    h?: number
} & PlatformButton

export const BaseButton = (props: Props) => {
    const {style, disabled = false, ...otherProps} = props
    const theme = useTheme()

    return (
        <TouchableOpacity
            onPress={props.action}
            activeOpacity={0.7}
            disabled={disabled}
            style={[
                {
                    backgroundColor: props.background
                        ? props.background
                        : theme.colors.background,
                    borderColor: props.background
                        ? props.background
                        : theme.colors.button,
                    width: props.w && `${props.w}%`,
                    height: props.h && `${props.h}%`,
                    margin: props.m,
                    marginVertical: props.my,
                    marginHorizontal: props.mx,
                    padding: props.p,
                    paddingVertical: props.py ? props.py : 14,
                    paddingHorizontal: props.px,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
                s.default,
            ]}
            {...otherProps}>
            {props.children}
        </TouchableOpacity>
    )
}

const s = StyleSheet.create({
    default: {
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
})
