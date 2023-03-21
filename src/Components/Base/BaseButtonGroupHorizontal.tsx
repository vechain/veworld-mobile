/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo } from "react"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { BaseButton } from "./BaseButton"
import DropShadow from "react-native-drop-shadow"
import { BaseView } from "./BaseView"
import { BaseIcon, BaseText } from "~Components"
import { StyleSheet } from "react-native"

export type Button = {
    id: string
    label: string

    disabled?: boolean
    icon?: string //MaterialCommunityIcons name
}

type Props = {
    action: (button: Button) => void
    buttons: Button[]
    /**
     * array of selected button ids
     */
    selectedButtonIds: string[]
}

export const BaseButtonGroupHorizontal = ({
    action,
    selectedButtonIds,
    buttons,
}: Props) => {
    const theme = useTheme()

    const onPress = useCallback(
        (button: Button) => () => action?.(button),
        [action],
    )

    const buttonWidth = useMemo(() => 100 / buttons.length, [buttons.length])

    const { styles } = useThemedStyles(baseStyles)

    return (
        <DropShadow style={theme.shadows.card}>
            <BaseView
                justifyContent="center"
                alignItems="center"
                flexDirection="row"
                style={styles.backgroundStyle}>
                {buttons.map((button, _) => {
                    const { id, label, disabled, icon } = button
                    const selected = selectedButtonIds.includes(id)

                    return (
                        <BaseButton
                            key={id}
                            action={onPress(button)}
                            disabled={disabled}
                            title={
                                <BaseView
                                    justifyContent="center"
                                    alignItems="center"
                                    flexDirection="row"
                                    style={{
                                        marginBottom: -5,
                                    }}>
                                    {icon && (
                                        <BaseIcon
                                            size={18}
                                            name={icon}
                                            color={
                                                selected
                                                    ? theme.colors.card
                                                    : theme.colors.text
                                            }
                                        />
                                    )}
                                    <BaseText
                                        color={
                                            selected
                                                ? theme.colors.card
                                                : theme.colors.text
                                        }
                                        typographyFont="buttonPrimary"
                                        px={5}>
                                        {label}
                                    </BaseText>
                                </BaseView>
                            }
                            bgColor={
                                selected
                                    ? theme.colors.primary
                                    : theme.colors.card
                            }
                            textColor={
                                selected
                                    ? theme.colors.textReversed
                                    : theme.colors.text
                            }
                            typographyFont="bodyMedium"
                            w={buttonWidth}
                            style={{
                                borderRadius: 16,
                                borderBottomColor: theme.colors.background,
                            }}
                        />
                    )
                })}
            </BaseView>
        </DropShadow>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
    })
