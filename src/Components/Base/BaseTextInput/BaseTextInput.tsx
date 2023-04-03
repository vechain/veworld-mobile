import React, { memo } from "react"
import { TextInput, StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { typography } from "~Common/Theme"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "../BaseView"
const { defaults: defaultTypography } = typography

type Props = {
    placeholder: string
    label?: string
    value?: string
    setValue?: (s: string) => void
    errorMessage?: string
}

export const BaseTextInput = memo(
    ({ placeholder, label, value, setValue, errorMessage }: Props) => {
        const { styles } = useThemedStyles(baseStyles)

        const theme = useTheme()

        return (
            <DropShadow>
                {label && (
                    <BaseText typographyFont="bodyMedium" my={8}>
                        {label}
                    </BaseText>
                )}
                <BaseView style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.text}
                        onChangeText={setValue}
                        value={value}
                    />
                </BaseView>
                {errorMessage && (
                    <BaseView py={10}>
                        <BaseView flexDirection="row">
                            <BaseIcon
                                name={"alert-circle-outline"}
                                size={20}
                                color={theme.colors.danger}
                            />
                            <BaseText
                                px={7}
                                color={theme.colors.danger}
                                typographyFont="caption">
                                {errorMessage}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                )}
            </DropShadow>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            ...theme.shadows.card,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderColor: theme.colors.transparent,
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
    })
