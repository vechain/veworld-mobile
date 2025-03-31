import React, { forwardRef, memo, useMemo } from "react"
import { KeyboardTypeOptions, StyleProp, StyleSheet, TextInputProps, ViewStyle } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { typography } from "~Constants/Theme"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { PlatformUtils } from "~Utils"

const { defaults: defaultTypography } = typography

export type BaseTextInputProps = {
    placeholder?: string
    label?: string
    value?: string
    errorMessage?: string
    testID?: string
    rightIcon?: IconKey | React.ReactElement
    rightIconTestID?: string
    rightIconStyle?: StyleProp<ViewStyle>
    rightIconSize?: number
    /**
     * Use adornment styles for the right icon. (Adds some default styles to the wrapper container)
     */
    rightIconAdornment?: boolean
    leftIcon?: IconKey | React.ReactElement
    leftIconTestID?: string
    leftIconStyle?: StyleProp<ViewStyle>
    leftIconSize?: number
    /**
     * Use adornment styles for the left icon. (Adds some default styles to the wrapper container)
     */
    leftIconAdornment?: boolean
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
            testID,
            rightIcon,
            rightIconTestID,
            rightIconStyle,
            onIconPress,
            setValue,
            containerStyle,
            inputContainerStyle,
            disabled,
            style,
            handleFocus,
            handleBlur,
            leftIcon,
            leftIconTestID,
            leftIconStyle,
            leftIconSize = 24,
            rightIconSize = 24,
            rightIconAdornment = true,
            leftIconAdornment = true,
            ...otherProps
        },
        ref,
    ) => {
        const { styles, theme } = useThemedStyles(baseStyles(!!errorMessage))

        const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

        const computedInputContainerStyles = useMemo(() => {
            const _styles = [styles.container, inputContainerStyle]
            if (disabled) return [..._styles, styles.disabledInput]
            return _styles
        }, [disabled, inputContainerStyle, styles])

        const computedInputStyles = useMemo(() => {
            const _styles = [
                styles.input,
                {
                    color: otherProps.editable ? theme.colors.text : theme.colors.textDisabled,
                },
                style,
            ]
            if (disabled) return [..._styles, styles.disabledInput]
            return _styles
        }, [disabled, otherProps.editable, style, styles, theme])

        const computedRightAdornmentStyles = useMemo(() => {
            const _styles = rightIconAdornment ? [styles.rightIconContainer] : []
            if (disabled) return [..._styles, styles.disabledInput]
            return _styles
        }, [disabled, rightIconAdornment, styles.disabledInput, styles.rightIconContainer])

        const renderRightIcon = useMemo(() => {
            if (!rightIcon) return null
            return typeof rightIcon === "string" ? (
                <BaseIcon
                    haptics="Light"
                    action={onIconPress}
                    name={rightIcon}
                    size={rightIconSize}
                    color={theme.colors.text}
                    style={[styles.rightIconStyle, rightIconStyle]}
                    testID={rightIconTestID}
                />
            ) : (
                <BaseView style={computedRightAdornmentStyles}>
                    <BaseView style={[styles.rightIconStyle, styles.rightElementStyle, rightIconStyle]}>
                        {rightIcon}
                    </BaseView>
                </BaseView>
            )
        }, [
            computedRightAdornmentStyles,
            onIconPress,
            rightIcon,
            rightIconSize,
            rightIconStyle,
            rightIconTestID,
            styles.rightElementStyle,
            styles.rightIconStyle,
            theme.colors.text,
        ])

        const computedLeftAdornmentStyles = useMemo(() => {
            const _styles = leftIconAdornment ? [styles.leftIconContainer] : []
            if (disabled) return [..._styles, styles.disabledInput]
            return _styles
        }, [disabled, leftIconAdornment, styles.disabledInput, styles.leftIconContainer])

        const renderLeftIcon = useMemo(() => {
            if (!leftIcon) return null
            return typeof leftIcon === "string" ? (
                <BaseIcon
                    haptics="Light"
                    action={onIconPress}
                    name={leftIcon}
                    size={leftIconSize}
                    color={theme.colors.text}
                    style={[styles.leftIconStyle, leftIconStyle]}
                    testID={leftIconTestID}
                />
            ) : (
                <BaseView style={computedLeftAdornmentStyles}>
                    <BaseView style={[styles.leftIconStyle, styles.leftElementStyle, leftIconStyle]}>
                        {leftIcon}
                    </BaseView>
                </BaseView>
            )
        }, [
            computedLeftAdornmentStyles,
            leftIcon,
            leftIconSize,
            leftIconStyle,
            leftIconTestID,
            onIconPress,
            styles.leftElementStyle,
            styles.leftIconStyle,
            theme.colors.text,
        ])

        const setInputParams = useMemo(() => {
            if (PlatformUtils.isAndroid()) {
                return {
                    keyboardType: "default" as KeyboardTypeOptions,
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
                <BaseView style={[computedInputContainerStyles]}>
                    {renderLeftIcon}
                    <TextInput
                        ref={ref}
                        style={[computedInputStyles]}
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
                    {renderRightIcon}
                </BaseView>
                {errorMessage && (
                    <BaseView pt={10} flexDirection="row" justifyContent="flex-start" style={styles.errorContainer}>
                        <BaseIcon name="icon-alert-circle" size={20} color={theme.colors.danger} />
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
            borderColor: isError ? theme.colors.danger : theme.colors.cardBorder,
            borderWidth: isError ? 2 : 1,
            borderRadius: 8,
            backgroundColor: theme.colors.card,
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 7,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: 8,
        },
        rightIconContainer: {
            maxWidth: 150,
            backgroundColor: theme.isDark ? theme.colors.card : COLORS.GREY_50,
            borderLeftColor: theme.colors.cardBorder,
            borderLeftWidth: 1,
            borderTopRightRadius: 7,
            borderBottomRightRadius: 7,
        },
        rightIconStyle: { justifyContent: "center", paddingHorizontal: 12 },
        rightElementStyle: { flex: 1 },
        leftIconContainer: {
            maxWidth: 150,
        },
        leftIconStyle: { justifyContent: "center", paddingRight: 12, paddingLeft: 16 },
        leftElementStyle: { flex: 1 },
        disabledInput: {
            backgroundColor: theme.colors.disabledInput,
        },
        errorContainer: {
            opacity: isError ? 1 : 0,
        },
    })

export const BaseTextInput = memo(BaseTextInputComponent)
BaseTextInput.displayName = "BaseTextInput"
