import React, { forwardRef, memo, useMemo } from "react"
import { StyleSheet, TextInputProps, StyleProp, ViewStyle, KeyboardTypeOptions } from "react-native"
import { useThemedStyles } from "~Hooks"
import { COLORS, typography, ColorThemeType } from "~Constants"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "../BaseView"
import { TextInput } from "react-native-gesture-handler"
import { PlatformUtils } from "~Utils"
const { defaults: defaultTypography } = typography

export type BaseTextInputProps = {
    placeholder?: string
    label?: string
    isPasswordInput?: boolean
    value?: string
    errorMessage?: string
    isError?: boolean
    testID?: string
    rightIcon?: string
    rightIconTestID?: string
    onIconPress?: () => void
    containerStyle?: StyleProp<ViewStyle>
    inputContainerStyle?: StyleProp<ViewStyle>
    setValue?: (s: string) => void
    disabled?: boolean
    inBottomSheet?: boolean
    handleFocus?: () => void
    handleBlur?: () => void
} & TextInputProps

export const BaseTextInputComponent = forwardRef<TextInput, BaseTextInputProps>(
    (
        {
            placeholder,
            label,
            value,
            isPasswordInput = false,
            errorMessage,
            isError,
            testID,
            rightIcon,
            rightIconTestID,
            onIconPress,
            setValue,
            containerStyle,
            inputContainerStyle,
            disabled,
            style,
            handleFocus,
            handleBlur,
            ...otherProps
        },
        ref,
    ) => {
        const { styles, theme } = useThemedStyles(baseStyles(!!isError || !!errorMessage))

        const setInputParams = useMemo(() => {
            if (PlatformUtils.isAndroid()) {
                return {
                    keyboardType: "email-address" as KeyboardTypeOptions,
                    autoCorrect: false,
                }
            } else {
                return {
                    keyboardType: undefined,
                    autoCorrect: undefined,
                }
            }
        }, [])

        const calculateTextColor = useMemo(() => {
            return isPasswordInput
                ? COLORS.GREY_600
                : otherProps.editable
                ? theme.colors.text
                : theme.colors.textDisabled
        }, [isPasswordInput, otherProps.editable, theme.colors.text, theme.colors.textDisabled])

        const calculatePlaceholderColor = useMemo(() => {
            return isPasswordInput
                ? COLORS.GREY_400
                : theme.isDark
                ? COLORS.WHITE_DISABLED
                : COLORS.DARK_PURPLE_DISABLED
        }, [isPasswordInput, theme.isDark])

        const inputStyle = useMemo(
            () => [isPasswordInput ? styles.inputPassword : styles.input, { color: calculateTextColor }, style],
            [isPasswordInput, styles.inputPassword, styles.input, calculateTextColor, style],
        )

        return (
            <BaseView style={containerStyle}>
                {label && (
                    <BaseText typographyFont="bodyMedium" mb={8}>
                        {label}
                    </BaseText>
                )}
                <BaseView style={[isPasswordInput ? styles.containerPassword : styles.container, inputContainerStyle]}>
                    <TextInput
                        ref={ref}
                        style={inputStyle}
                        // workarounds for android crashing when using the keyboard
                        keyboardType={setInputParams.keyboardType}
                        autoCorrect={setInputParams.autoCorrect}
                        placeholder={placeholder}
                        placeholderTextColor={calculatePlaceholderColor}
                        onChangeText={setValue}
                        value={value}
                        autoCapitalize="none"
                        testID={testID}
                        editable={!disabled}
                        selectTextOnFocus={disabled}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...otherProps}
                    />
                    {rightIcon && (
                        <BaseIcon
                            haptics="Light"
                            action={onIconPress}
                            name={rightIcon}
                            p={8}
                            size={16}
                            color={COLORS.GREY_500}
                            testID={rightIconTestID}
                        />
                    )}
                </BaseView>
                {errorMessage && (
                    <BaseView pt={10} flexDirection="row" justifyContent="flex-start" style={styles.errorContainer}>
                        <BaseIcon name="alert-circle-outline" size={20} color={theme.colors.danger} />
                        <BaseText px={7} color={theme.colors.danger} typographyFont="caption">
                            {errorMessage || " "}
                        </BaseText>
                    </BaseView>
                )}
            </BaseView>
        )
    },
)

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderColor: isError ? theme.colors.danger : theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: 8,
        },
        containerPassword: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderColor: isError ? COLORS.RED_500 : COLORS.GREY_200,
            borderWidth: isError ? 2 : 1,
            borderRadius: 8,
            paddingVertical: isError ? 6 : 7,
            paddingRight: 4,
            paddingLeft: 16,
            backgroundColor: COLORS.WHITE,
        },
        inputPassword: {
            flex: 1,
            backgroundColor: theme.colors.transparent,
            borderRadius: 8,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            lineHeight: defaultTypography.subTitle.lineHeight,
        },
        errorContainer: {
            opacity: isError ? 1 : 0,
        },
    })

export const BaseTextInput = memo(BaseTextInputComponent)
BaseTextInput.displayName = "BaseTextInput"
