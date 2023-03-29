/* eslint-disable react-native/no-inline-styles */
import React, { useCallback } from "react"
import { useTheme } from "~Common"
import { BaseButton } from "./BaseButton"
import DropShadow from "react-native-drop-shadow"

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
}

export const BaseButtonGroup = ({
    action,
    selectedButtonIds,
    buttons,
    buttonTestID,
}: Props) => {
    const theme = useTheme()

    const onPress = useCallback(
        (button: Button) => () => action(button),
        [action],
    )

    return (
        <DropShadow style={theme.shadows.card}>
            {buttons.map((button, index) => {
                const { id, label, disabled } = button
                const selected = selectedButtonIds.includes(id)

                const borderTopRadius = index === 0 ? 16 : 0
                const borderBottomRadius = index === buttons.length - 1 ? 16 : 0
                return (
                    <BaseButton
                        key={id}
                        action={onPress(button)}
                        disabled={disabled}
                        title={label}
                        bgColor={
                            selected ? theme.colors.primary : theme.colors.card
                        }
                        textColor={
                            selected
                                ? theme.colors.textReversed
                                : theme.colors.text
                        }
                        typographyFont="bodyMedium"
                        style={{
                            borderTopLeftRadius: borderTopRadius,
                            borderTopRightRadius: borderTopRadius,
                            borderBottomLeftRadius: borderBottomRadius,
                            borderBottomRightRadius: borderBottomRadius,
                            borderBottomWidth:
                                index === buttons.length - 1 ? 0 : 1,
                            borderBottomColor: theme.colors.background,
                        }}
                        testID={`${buttonTestID}-${id}`}
                    />
                )
            })}
        </DropShadow>
    )
}
