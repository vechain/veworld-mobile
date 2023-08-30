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
import Lottie from "lottie-react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import { StyleProps } from "react-native-reanimated"
import HapticsService from "~Services/HapticsService"

const { defaults: defaultTypography, ...otherTypography } = typography

type Props = {
    action: () => void
    disabledAction?: () => void
    disabled?: boolean
    isDisabledTextOnly?: boolean
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
    haptics?: "Success" | "Warning" | "Error" | "Light" | "Medium" | "Heavy"
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    isLoading?: boolean
    loaderStyle?: StyleProps
    invertLoaderColor?: boolean
    darkLoader?: boolean
    flex?: number
    activeOpacity?: number
    disabledActionHaptics?:
        | "Success"
        | "Warning"
        | "Error"
        | "Light"
        | "Medium"
        | "Heavy"
        | undefined
} & TouchableOpacityProps

export const BaseButton = ({
    style,
    textColor,
    variant = "solid",
    size = "lg",
    radius = 16,
    disabled = false,
    isDisabledTextOnly = false,
    leftIcon,
    rightIcon,
    isLoading = false,
    activeOpacity = 0.7,
    flex,
    loaderStyle,
    invertLoaderColor = false,
    disabledAction,
    disabledActionHaptics,
    ...otherProps
}: Props) => {
    const {
        typographyFont,
        fontFamily,
        fontSize,
        fontWeight,
        children,
        haptics,
        action,
        bgColor,
        px,
        py,
        w,
        h,
        m,
        my,
        mx,
        p,
        selfAlign,
        title,
    } = otherProps
    const { styles: themedStyles, theme } = useThemedStyles(
        baseStyles(variant === "link"),
    )

    const onButtonPress = useCallback(() => {
        if (disabled) {
            disabledAction?.()
            disabledActionHaptics &&
                HapticsService.triggerHaptics({
                    haptics: disabledActionHaptics,
                })
        } else {
            action()
            haptics && HapticsService.triggerHaptics({ haptics })
        }
    }, [action, disabled, disabledAction, disabledActionHaptics, haptics])

    const backgroundColor = useMemo(() => {
        if (bgColor) return bgColor
        return theme.colors.primary
    }, [theme, bgColor])

    const isSolidButton = useMemo(() => variant === "solid", [variant])
    const isOutlineButton = useMemo(() => variant === "outline", [variant])

    const paddingX = useMemo(() => {
        if (Number.isFinite(px)) return px
        if (size === "sm") return 8
        if (size === "md") return 8
        if (size === "lg") return 16
    }, [px, size])

    const paddingY = useMemo(() => {
        if (Number.isFinite(py)) return py
        if (size === "sm") return 3.5
        if (size === "md") return 9.5
        if (size === "lg") return 15
    }, [py, size])

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

    const calculateBackgroundColor = useMemo(() => {
        if (disabled && isDisabledTextOnly) return backgroundColor
        if (disabled) return theme.colors.disabledButton

        if (isSolidButton) return backgroundColor
        else return theme.colors.transparent
    }, [
        backgroundColor,
        disabled,
        isDisabledTextOnly,
        isSolidButton,
        theme.colors.disabledButton,
        theme.colors.transparent,
    ])

    const calculateTextColor = useMemo(() => {
        return (
            textColor ??
            (isSolidButton ? theme.colors.background : theme.colors.text)
        )
    }, [isSolidButton, textColor, theme.colors.background, theme.colors.text])

    return (
        <TouchableOpacity
            onPress={onButtonPress}
            activeOpacity={disabled ? 1 : activeOpacity}
            style={[
                {
                    backgroundColor: calculateBackgroundColor,
                    borderColor: isOutlineButton
                        ? backgroundColor
                        : theme.colors.transparent,
                    width: w && `${w}%`,
                    height: h && `${h}%`,
                    margin: m,
                    marginVertical: my,
                    marginHorizontal: mx,
                    padding: p,
                    paddingVertical: paddingY,
                    paddingHorizontal: paddingX,
                    alignSelf: selfAlign,
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
                    color={calculateTextColor}
                    typographyFont={computedTypographyFont}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    style={themedStyles.text}>
                    {title}
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
            height: 20,
            marginVertical: -2,
        },
    })
