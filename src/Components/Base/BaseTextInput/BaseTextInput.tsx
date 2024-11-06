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

        const placeholderColor = COLORS.GREY_400

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

        return (
            <BaseView style={containerStyle}>
                {label && (
                    <BaseText typographyFont="bodyMedium" mb={8}>
                        {label}
                    </BaseText>
                )}
                <BaseView style={[styles.container, inputContainerStyle]}>
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            {
                                color: otherProps.editable ? COLORS.GREY_600 : theme.colors.textDisabled,
                            },
                            style,
                        ]}
                        // workarounds for android crashing when using the keyboard
                        keyboardType={setInputParams.keyboardType}
                        autoCorrect={setInputParams.autoCorrect}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
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
            borderColor: isError ? COLORS.RED_500 : COLORS.GREY_200,
            borderWidth: isError ? 2 : 1,
            borderRadius: 8,
            paddingVertical: 8,
            paddingRight: 4,
            paddingLeft: 16,
            backgroundColor: COLORS.WHITE,
        },
        input: {
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
