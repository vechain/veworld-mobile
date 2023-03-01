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
import * as Haptics from "expo-haptics"

import { Theme } from "~Common"
const {
    typography: { defaults: defaultTypography, ...otherTypography },
} = Theme

type Props = {
    action: () => void
    disabled?: boolean
    variant?: "solid" | "outline" | "ghost"
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
    size?: "sm" | "md" | "lg"
    typographyFont?: keyof typeof defaultTypography
    fontSize?: keyof typeof otherTypography.fontSize
    fontWeight?: keyof typeof otherTypography.fontWeight
    fontFamily?: keyof typeof otherTypography.fontFamily
    selfAlign?: "auto" | FlexAlignType
    haptics?: "light" | "medium" | "heavy"
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
} & TouchableOpacityProps

export const BaseButton = ({
    style,
    variant = "solid",
    size = "lg",
    disabled = false,
    leftIcon,
    rightIcon,
    ...otherProps
}: Props) => {
    const { typographyFont, fontFamily, fontSize, fontWeight } = otherProps

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
    const isOutlineButton = useMemo(() => variant === "outline", [variant])

    const paddingX = useMemo(() => {
        if (otherProps.px) return otherProps.px
        if (size === "sm") return 8
        if (size === "lg") return 16
    }, [otherProps.px, size])

    const paddingY = useMemo(() => {
        if (otherProps.py) return otherProps.py
        if (size === "sm") return 4
        if (size === "lg") return 15
    }, [otherProps.py, size])

    const computedFontSize = useMemo(() => {
        if (fontSize) return fontSize
        if (typographyFont)
            return defaultTypography[typographyFont]
                .fontSize as keyof typeof otherTypography.fontSize
        if (size === "sm") return 10
    }, [fontSize, size, typographyFont])

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
                    paddingVertical: paddingY,
                    paddingHorizontal: paddingX,
                    opacity: disabled ? 0.5 : 1,
                    alignSelf: otherProps.selfAlign,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: leftIcon || rightIcon ? "row" : "column",
                },
                style,
                baseStyle.default,
            ]}
            {...otherProps}>
            {leftIcon}
            <BaseText
                color={
                    isSolidButton ? theme.colors.background : theme.colors.text
                }
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                typographyFont={typographyFont}
                fontSize={computedFontSize}>
                {otherProps.title}
            </BaseText>
            {rightIcon}
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
