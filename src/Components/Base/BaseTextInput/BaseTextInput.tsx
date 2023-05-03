import React, { memo } from "react"
import {
    TextInput,
    StyleSheet,
    TextInputProps,
    StyleProp,
    ViewStyle,
} from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { COLORS, typography } from "~Common/Theme"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "../BaseView"
const { defaults: defaultTypography } = typography

type Props = {
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
} & TextInputProps

export const BaseTextInput = memo(
    ({
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
        ...otherProps
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles(!!errorMessage))

        const placeholderColor = theme.isDark
            ? COLORS.WHITE_DISABLED
            : COLORS.DARK_PURPLE_DISABLED

        return (
            <DropShadow style={containerStyle}>
                {label && (
                    <BaseText typographyFont="bodyMedium" mb={8}>
                        {label}
                    </BaseText>
                )}
                <BaseView style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
                        onChangeText={setValue}
                        value={value}
                        autoCapitalize="none"
                        testID={testID}
                        {...otherProps}
                    />
                    {rightIcon && (
                        <BaseIcon
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
            </DropShadow>
        )
    },
)

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            ...theme.shadows.card,
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
            color: theme.colors.text,
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
