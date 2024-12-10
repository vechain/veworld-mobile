import React, { memo, useMemo } from "react"
import { KeyboardTypeOptions, StyleSheet, TextInput } from "react-native"
import { useTheme, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, typography } from "~Constants"
import { BaseIcon, BaseTouchable, BaseView } from "~Components"
import { PlatformUtils } from "~Utils"
import { IconKey } from "~Model"

const { defaults: defaultTypography } = typography

type Props = {
    placeholder?: string
    value?: string
    setValue?: (s: string) => void
    testID?: string
    showIcon?: boolean
    iconName?: IconKey
    iconSize?: number
    onIconPress?: () => void
}

export const BaseSearchInput = memo(
    ({
        placeholder = "Search",
        value,
        setValue,
        testID,
        showIcon = true,
        iconName = "icon-zoom-in",
        iconSize = 24,
        onIconPress,
    }: Props) => {
        const { styles } = useThemedStyles(baseStyles)

        const theme = useTheme()

        const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

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
            <BaseView style={styles.container}>
                <TextInput
                    // workarounds for android crashing when using the keyboard
                    keyboardType={setInputParams.keyboardType}
                    autoCorrect={setInputParams.autoCorrect}
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    onChangeText={setValue}
                    value={value}
                    testID={testID}
                />
                {showIcon && (
                    <BaseTouchable disabled={!onIconPress} onPress={onIconPress}>
                        <BaseIcon
                            name={iconName}
                            size={iconSize}
                            color={theme.colors.text}
                            style={styles.icon}
                            testID="magnify"
                        />
                    </BaseTouchable>
                )}
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
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
        icon: {
            paddingVertical: 12,
            paddingLeft: 8,
            paddingRight: 16,
        },
    })
