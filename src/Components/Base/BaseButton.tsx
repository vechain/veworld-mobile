/* eslint-disable react-native/no-inline-styles */
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    FlexAlignType,
} from "react-native"
import React, { useCallback, useMemo } from "react"
import { useTheme } from "~Common"
import { BaseText } from "./BaseText"
import { LocalizedString } from "typesafe-i18n"
import { TFonts } from "~Model"
import * as Haptics from "expo-haptics"

type Props = {
    action: () => void
    disabled?: boolean
    variant?: "solid" | "outline"
    bgColor?: string
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

export const BaseButton = ({
    style,
    variant = "solid",
    disabled = false,
    ...otherProps
}: Props) => {
    const theme = useTheme()

    const onButtonPress = useCallback(() => {
        if (otherProps.haptics) {
            switch (otherProps.haptics) {
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

        otherProps.action()
    }, [otherProps])

    const bgColor = useMemo(() => {
        if (otherProps.bgColor) return otherProps.bgColor
        return theme.colors.primary
    }, [theme, otherProps.bgColor])

    const isSolidButton = useMemo(() => variant === "solid", [variant])
    const isOutlineButton = useMemo(() => variant === "solid", [variant])

    return (
        <TouchableOpacity
            onPress={onButtonPress}
            activeOpacity={0.7}
            disabled={disabled}
            style={[
                {
                    backgroundColor: isSolidButton
                        ? bgColor
                        : theme.colors.transparent,
                    borderColor: isOutlineButton
                        ? bgColor
                        : theme.colors.transparent,
                    width: otherProps.w && `${otherProps.w}%`,
                    height: otherProps.h && `${otherProps.h}%`,
                    margin: otherProps.m,
                    marginVertical: otherProps.my,
                    marginHorizontal: otherProps.mx,
                    padding: otherProps.p,
                    paddingVertical: otherProps.py ? otherProps.py : 14,
                    paddingHorizontal: otherProps.px,
                    opacity: disabled ? 0.5 : 1,
                    alignSelf: otherProps.selfAlign,
                },
                style,
                baseStyle.default,
            ]}
            {...otherProps}>
            <BaseText
                color={
                    isSolidButton ? theme.colors.background : theme.colors.text
                }
                font={otherProps.font ? otherProps.font : "body_accent"}>
                {otherProps.title}
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
