import React, { useCallback } from "react"
import { useTheme, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseView } from "./BaseView"
import { BaseIcon, BaseText } from "~Components"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseButtonGroupHorizontalType } from "~Model"
import HapticsService from "~Services/HapticsService"

type Props = {
    action: (button: BaseButtonGroupHorizontalType) => void
    buttons: BaseButtonGroupHorizontalType[]
    /**
     * array of selected button ids
     */
    selectedButtonIds: string[]
    disabled?: boolean
    renderButton?: (button: BaseButtonGroupHorizontalType, textColor: string) => React.ReactNode
}

export const BaseButtonGroupHorizontal = ({
    action,
    selectedButtonIds,
    buttons,
    disabled: disableAllButtons,
    renderButton,
}: Props) => {
    const theme = useTheme()

    const onPress = useCallback(
        (button: BaseButtonGroupHorizontalType) => () => {
            HapticsService.triggerHaptics({
                haptics: "Light",
            })
            action(button)
        },
        [action],
    )

    const { styles } = useThemedStyles(baseStyles)

    const calculateBGColor = useCallback(
        (selected: boolean, disabledStatus: boolean | undefined) => {
            if (disabledStatus && selected) {
                return theme.colors.disabled
            }
            if (selected) {
                return theme.colors.primary
            }
            return theme.colors.card
        },
        [theme.colors.card, theme.colors.disabled, theme.colors.primary],
    )

    const calculateTextColor = useCallback(
        (selected: boolean, disabledStatus: boolean | undefined) => {
            if (disabledStatus) {
                return theme.colors.textDisabled
            }
            if (selected) {
                return theme.colors.card
            }
            return theme.colors.text
        },
        [theme.colors.card, theme.colors.text, theme.colors.textDisabled],
    )

    return (
        <BaseView flexDirection="row" alignItems="stretch" style={styles.backgroundStyle}>
            {buttons.map((button, _) => {
                const { id, label, disabled, icon } = button
                const disabledStatus = disableAllButtons || disabled
                const selected = selectedButtonIds.includes(id)
                const bgColor = calculateBGColor(selected, disabledStatus)
                const textColor = calculateTextColor(selected, disabledStatus)

                return (
                    <BaseView key={id} bg={bgColor} style={styles.buttonStyle} flex={1}>
                        <TouchableOpacity
                            testID={`button-${id}`}
                            style={styles.pressable}
                            onPress={onPress(button)}
                            disabled={disabledStatus}>
                            {renderButton ? (
                                renderButton(button, textColor)
                            ) : (
                                <BaseView justifyContent="center" alignItems="center" flexDirection="row">
                                    {icon && <BaseIcon size={18} name={icon} color={textColor} />}
                                    <BaseText color={textColor} typographyFont="buttonPrimary" px={5}>
                                        {label}
                                    </BaseText>
                                </BaseView>
                            )}
                        </TouchableOpacity>
                    </BaseView>
                )
            })}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        buttonStyle: {
            borderRadius: 16,
        },
        pressable: {
            padding: 10,
        },
    })
