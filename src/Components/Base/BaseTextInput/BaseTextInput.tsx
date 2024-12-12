import React, { forwardRef, memo, useMemo } from "react"
import { KeyboardTypeOptions, StyleProp, StyleSheet, TextInputProps, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, typography } from "~Constants"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { TextInput } from "react-native-gesture-handler"
import { PlatformUtils } from "~Utils"
import { IconKey } from "~Model"

const { defaults: defaultTypography } = typography

export type BaseTextInputProps = {
    placeholder?: string
    label?: string
    value?: string
    errorMessage?: string
    testID?: string
    rightIcon?: IconKey | React.ReactElement
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
        const { styles, theme } = useThemedStyles(baseStyles(!!errorMessage))

        const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

        const renderRightIcon = useMemo(() => {
            if (!rightIcon) return null
            return typeof rightIcon === "string" ? (
                <BaseIcon
                    haptics="Light"
                    action={onIconPress}
                    name={rightIcon}
                    size={24}
                    color={theme.colors.text}
                    style={styles.rightIconStyle}
                    testID={rightIconTestID}
                />
            ) : (
                rightIcon
            )
        }, [onIconPress, rightIcon, rightIconTestID, styles.rightIconStyle, theme.colors.text])

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
                <BaseView style={[styles.container, inputContainerStyle]}>
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            {
                                color: otherProps.editable ? theme.colors.text : theme.colors.textDisabled,
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
            borderColor: isError ? theme.colors.danger : theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 16,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: 8,
        },
        rightIconStyle: {
            marginRight: 16,
        },
        errorContainer: {
            opacity: isError ? 1 : 0,
        },
    })

export const BaseTextInput = memo(BaseTextInputComponent)
BaseTextInput.displayName = "BaseTextInput"
