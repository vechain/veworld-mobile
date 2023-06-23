/* eslint-disable react-native/no-inline-styles */
import {
    TouchableOpacity,
    TouchableOpacityProps,
    FlexAlignType,
    StyleSheet,
} from "react-native"
import React, { useCallback, useMemo } from "react"
import { ColorThemeType, typography, TFonts } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseText } from "./BaseText"
import * as Haptics from "expo-haptics"
import Lottie from "lottie-react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import { StyleProps } from "react-native-reanimated"

const { defaults: defaultTypography, ...otherTypography } = typography

type Props = {
    action: () => void
    disabled?: boolean
    variant?: "solid" | "outline" | "ghost" | "link"
    bgColor?: string
    textColor?: string
    title?: string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    w?: number // NOTE: this is a number in percentage
    h?: number // NOTE: this is a number in percentage
    radius?: number
    size?: "sm" | "md" | "lg"
    typographyFont?: keyof typeof defaultTypography
    fontSize?: keyof typeof otherTypography.fontSize
    fontWeight?: keyof typeof otherTypography.fontWeight
    fontFamily?: keyof typeof otherTypography.fontFamily
    selfAlign?: "auto" | FlexAlignType
    haptics?: "light" | "medium" | "heavy"
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    isLoading?: boolean
    loaderStyle?: StyleProps
    invertLoaderColor?: boolean
    darkLoader?: boolean
    flex?: number
    activeOpacity?: number
} & TouchableOpacityProps

export const BaseButton = ({
    style,
    textColor,
    variant = "solid",
    size = "lg",
    radius = 16,
    disabled = false,
    leftIcon,
    rightIcon,
    isLoading = false,
    activeOpacity = 0.7,
    flex,
    loaderStyle,
    invertLoaderColor = false,
    ...otherProps
}: Props) => {
    const { typographyFont, fontFamily, fontSize, fontWeight, children } =
        otherProps
    const { styles: themedStyles, theme } = useThemedStyles(
        baseStyles(variant === "link"),
    )

    const onButtonPress = useCallback(async () => {
        if (otherProps.haptics) {
            switch (otherProps.haptics) {
                case Haptics.ImpactFeedbackStyle.Light:
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    break

                case Haptics.ImpactFeedbackStyle.Medium:
                    await Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Medium,
                    )
                    break

                case Haptics.ImpactFeedbackStyle.Heavy:
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
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
        if (Number.isFinite(otherProps.px)) return otherProps.px
        if (size === "sm") return 8
        if (size === "md") return 8
        if (size === "lg") return 16
    }, [otherProps.px, size])

    const paddingY = useMemo(() => {
        if (Number.isFinite(otherProps.py)) return otherProps.py
        if (size === "sm") return 3.5
        if (size === "md") return 9.5
        if (size === "lg") return 15
    }, [otherProps.py, size])

    const computedTypographyFont: TFonts | undefined = useMemo(() => {
        if (typographyFont) return typographyFont
        if (size === "sm") return "smallButtonPrimary"
        if (size === "md") return "button"
        if (size === "lg") return "buttonPrimary"
    }, [size, typographyFont])

    const lottieSource = useMemo(() => {
        if (invertLoaderColor) {
            return theme.isDark ? LoaderLight : LoaderDark
        } else {
            return theme.isDark ? LoaderDark : LoaderLight
        }
    }, [theme, invertLoaderColor])

    return (
        <TouchableOpacity
            onPress={onButtonPress}
            activeOpacity={activeOpacity}
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
                    borderRadius: radius,
                    borderWidth: isOutlineButton ? 1 : 0,
                    flex,
                },
                style,
            ]}
            {...otherProps}>
            {leftIcon}
            {!isLoading ? (
                <BaseText
                    color={
                        textColor ||
                        (isSolidButton
                            ? theme.colors.background
                            : theme.colors.text)
                    }
                    typographyFont={computedTypographyFont}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    style={themedStyles.text}>
                    {otherProps.title}
                    {children}
                </BaseText>
            ) : (
                <Lottie
                    source={lottieSource}
                    autoPlay
                    loop
                    style={{ ...themedStyles.lottie, ...loaderStyle }}
                />
            )}

            {rightIcon}
        </TouchableOpacity>
    )
}

const baseStyles = (isLink: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        text: {
            textDecorationLine: isLink ? "underline" : "none",
            textDecorationColor: theme.colors.text,
        },
        // ratio width:hight is 2:1
        lottie: {
            width: 60,
            height: 30,
        },
    })
