import React, { forwardRef, memo } from "react"
import { StyleSheet, TextInputProps, StyleProp, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { COLORS, typography, ColorThemeType } from "~Constants"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "../BaseView"
import { TextInput } from "react-native-gesture-handler"
const { defaults: defaultTypography } = typography

export type BaseTextInputProps = {
    placeholder?: string
    label?: string
    value?: string
    errorMessage?: string
    testID?: string
    rightIcon?: string
    rightIconTestID?: string
    onIconPress?: () => void
    containerStyle?: StyleProp<ViewStyle>
    setValue?: (s: string) => void
    disabled?: boolean
    inBottomSheet?: boolean
} & TextInputProps

const BaseTextInputComponent = forwardRef<TextInput, BaseTextInputProps>(
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
            disabled,
            ...otherProps
        },
        ref,
    ) => {
        const { styles, theme } = useThemedStyles(baseStyles(!!errorMessage))

        const placeholderColor = theme.isDark
            ? COLORS.WHITE_DISABLED
            : COLORS.DARK_PURPLE_DISABLED

        return (
            <BaseView style={containerStyle}>
                {label && (
                    <BaseText typographyFont="bodyMedium" mb={8}>
                        {label}
                    </BaseText>
                )}
                <BaseView style={styles.container}>
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            {
                                color: otherProps.editable
                                    ? theme.colors.text
                                    : theme.colors.textDisabled,
                            },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
                        onChangeText={setValue}
                        value={value}
                        autoCapitalize="none"
                        testID={testID}
                        editable={disabled}
                        selectTextOnFocus={disabled}
                        {...otherProps}
                    />
                    {rightIcon && (
                        <BaseIcon
                            haptics="Light"
                            action={onIconPress}
                            name={rightIcon}
                            size={24}
                            color={theme.colors.text}
                            style={styles.rightIconStyle}
                            testID={rightIconTestID}
                        />
                    )}
                </BaseView>
                <BaseView
                    pt={10}
                    flexDirection="row"
                    justifyContent="flex-start"
                    style={styles.errorContainer}>
                    <BaseIcon
                        name={"alert-circle-outline"}
                        size={20}
                        color={theme.colors.danger}
                    />
                    <BaseText
                        px={7}
                        color={theme.colors.danger}
                        typographyFont="caption">
                        {errorMessage || " "}
                    </BaseText>
                </BaseView>
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
            borderColor: isError
                ? theme.colors.danger
                : theme.colors.transparent,
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
