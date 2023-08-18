/* eslint-disable react-native/no-inline-styles */
import React, { useCallback } from "react"
import { useTheme } from "~Hooks"
import { BaseButton } from "./BaseButton"
import { TFonts } from "~Constants"
import { BaseView } from "./BaseView"
import { BaseSpacer } from "./BaseSpacer"

export type Button = {
    id: string
    label: string
    disabled?: boolean
}

type Props = {
    action: (button: Button) => void
    buttons: Button[]
    /**
     * array of selected button ids
     */
    selectedButtonIds: string[]
    buttonTestID?: string
    buttonGroupTestID?: string
    selectedColor?: string
    typographyFont?: TFonts
}

export const BaseButtonGroup = ({
    action,
    selectedButtonIds,
    buttons,
    buttonTestID,
    buttonGroupTestID,
    selectedColor,
    typographyFont = "bodyMedium",
}: Props) => {
    const theme = useTheme()

    const onPress = useCallback(
        (button: Button) => () => action(button),
        [action],
    )

    return (
        <BaseView testID={buttonGroupTestID}>
            {buttons.map((button, index) => {
                const { id, label, disabled } = button
                const selected = selectedButtonIds.includes(id)

                const borderTopRadius = index === 0 ? 16 : 0
                const borderBottomRadius = index === buttons.length - 1 ? 16 : 0
                const bgColor = selected
                    ? selectedColor || theme.colors.primary
                    : theme.colors.card
                const textColor = selected
                    ? theme.colors.textReversed
                    : theme.colors.text
                return (
                    <>
                        <BaseButton
                            key={`${index}-${label}`}
                            action={onPress(button)}
                            disabled={disabled}
                            title={label}
                            bgColor={bgColor}
                            textColor={textColor}
                            haptics="Light"
                            typographyFont={typographyFont}
                            style={{
                                borderTopLeftRadius: borderTopRadius,
                                borderTopRightRadius: borderTopRadius,
                                borderBottomLeftRadius: borderBottomRadius,
                                borderBottomRightRadius: borderBottomRadius,
                                borderBottomColor: theme.colors.background,
                            }}
                            testID={`${buttonTestID}-${id}`}
                        />
                        {index !== buttons.length - 1 && (
                            <BaseSpacer height={1} />
                        )}
                    </>
                )
            })}
        </BaseView>
    )
}
