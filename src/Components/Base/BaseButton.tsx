/* eslint-disable react-native/no-inline-styles */
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    FlexAlignType,
} from "react-native"
import React, { useCallback } from "react"
import { useTheme } from "~Common"
import { BaseText } from "./BaseText"
import { LocalizedString } from "typesafe-i18n"
import { TFonts } from "~Model"
import * as Haptics from "expo-haptics"

type Props = {
    action: () => void
    disabled?: boolean
    filled?: boolean
    bordered?: boolean
    title: LocalizedString | string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    w?: number
    h?: number
    font?: TFonts
    selfAlign?: "auto" | FlexAlignType
    haptics?: "light" | "medium" | "heavy"
} & TouchableOpacityProps

export const BaseButton = (props: Props) => {
    const { style, disabled = false, ...otherProps } = props
    const theme = useTheme()

    const onButtonPress = useCallback(() => {
        if (props.haptics) {
            switch (props.haptics) {
                case Haptics.ImpactFeedbackStyle.Light:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    break

                case Haptics.ImpactFeedbackStyle.Medium:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    break

                case Haptics.ImpactFeedbackStyle.Heavy:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                    break

                default:
                    break
            }
        }

        props.action()
    }, [props])

    return (
        <TouchableOpacity
            onPress={onButtonPress}
            activeOpacity={0.7}
            disabled={disabled}
            style={[
                {
                    backgroundColor: props.filled
                        ? theme.colors.primary
                        : theme.colors.transparent,
                    borderColor: props.bordered
                        ? theme.colors.primary
                        : theme.colors.transparent,
                    width: props.w && `${props.w}%`,
                    height: props.h && `${props.h}%`,
                    margin: props.m,
                    marginVertical: props.my,
                    marginHorizontal: props.mx,
                    padding: props.p,
                    paddingVertical: props.py ? props.py : 14,
                    paddingHorizontal: props.px,
                    opacity: disabled ? 0.5 : 1,
                    alignSelf: props.selfAlign,
                },
                style,
                baseStyle.default,
            ]}
            {...otherProps}>
            <BaseText
                color={
                    props.filled ? theme.colors.background : theme.colors.text
                }
                font={props.font ? props.font : "body_accent"}>
                {props.title}
            </BaseText>
        </TouchableOpacity>
    )
}

const baseStyle = StyleSheet.create({
    default: {
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
    },
})
