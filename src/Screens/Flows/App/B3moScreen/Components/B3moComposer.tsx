import React, { useCallback, useState } from "react"
import { StyleSheet, TextInput } from "react-native"
import { BaseIcon, BaseTouchable, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"

export type B3moComposerProps = {
    onSend: (text: string) => void
    disabled?: boolean
}

export const B3moComposer = ({ onSend, disabled }: B3moComposerProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [text, setText] = useState("")

    const submit = useCallback(() => {
        const trimmed = text.trim()
        if (!trimmed || disabled) return
        onSend(trimmed)
        setText("")
    }, [text, onSend, disabled])

    return (
        <BaseView style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={LL.B3MO_AGENT_COMPOSER_PLACEHOLDER()}
                placeholderTextColor={theme.colors.subtitle}
                value={text}
                onChangeText={setText}
                multiline
                editable={!disabled}
                onSubmitEditing={submit}
                blurOnSubmit
                testID="b3mo-composer-input"
            />
            <BaseTouchable action={submit} testID="b3mo-composer-send">
                <BaseIcon
                    name="icon-arrow-up"
                    size={26}
                    color={text.trim() ? theme.colors.primary : theme.colors.subtitle}
                />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.colors.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            gap: 8,
        },
        input: {
            flex: 1,
            color: theme.colors.text,
            fontSize: 15,
            maxHeight: 120,
            padding: 8,
        },
    })
