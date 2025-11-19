import React, { useCallback, useMemo, useState } from "react"
import { z } from "zod"
import { BaseIcon, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

export type ResettableTextInputProps = {
    defaultValue: string | undefined
    label: string
    description?: string
    placeholder: string
    onSave: (value: string) => void
    validationSchema: z.ZodOptional<z.ZodString> | z.ZodString
}

export const ResettableTextInput = ({
    label,
    description,
    defaultValue = "",
    validationSchema,
    onSave: _onSave,
    ...props
}: ResettableTextInputProps) => {
    const theme = useTheme()
    const [enabled, setEnabled] = useState(false)
    const [value, setValue] = useState(defaultValue)
    const [error, setError] = useState("")

    const isDirty = useMemo(() => {
        if (!defaultValue && value) return true
        if (defaultValue && defaultValue !== value) return true
        return false
    }, [defaultValue, value])

    const onSave = useCallback(() => {
        const parsed = validationSchema.safeParse(value || undefined)
        if (!parsed.success) {
            setError(parsed.error.flatten().formErrors.join("\n"))
            return
        }
        _onSave(parsed.data ?? "")
    }, [_onSave, validationSchema, value])

    const onReset = useCallback(() => {
        setValue("")
    }, [])

    const onIconPress = useCallback(() => {
        if (!enabled) {
            setEnabled(true)
            return
        }
        if (defaultValue !== value) {
            onSave()
            if (value === "") setEnabled(false)
            return
        }
        if (value) return onReset()
        setEnabled(false)
    }, [defaultValue, enabled, onReset, onSave, value])

    const inputIcon = useMemo<IconKey>(() => {
        if (!enabled) return "icon-pencil"
        if (isDirty) return "icon-check"
        return "icon-undo"
    }, [enabled, isDirty])

    return (
        <BaseView>
            <BaseText typographyFont="captionSemiBold" pb={8}>
                {label}
            </BaseText>
            {description && (
                <>
                    <BaseText typographyFont="caption" color={theme.colors.editSpeedBs.subtitle}>
                        {description}
                    </BaseText>
                    <BaseSpacer height={12} />
                </>
            )}

            <BaseTextInput
                rightIcon={<BaseIcon name={inputIcon} color={theme.colors.text} action={onIconPress} />}
                value={value}
                onChange={e => {
                    setValue(e.nativeEvent.text)
                    setError("")
                }}
                errorMessage={error}
                disabled={!enabled}
                {...props}
            />
        </BaseView>
    )
}
