import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTextProps } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { BaseButtonGroupHorizontalType } from "~Model"
import HapticsService from "~Services/HapticsService"
import { BaseView } from "./BaseView"

type Props = {
    action: (button: BaseButtonGroupHorizontalType) => void
    buttons: BaseButtonGroupHorizontalType[]
    /**
     * array of selected button ids
     */
    selectedButtonIds: string[]
    disabled?: boolean
    typographyFont?: BaseTextProps["typographyFont"]
    renderButton?: (button: BaseButtonGroupHorizontalType, textColor: string) => React.ReactNode
    style?: ViewStyle
    color?: string
    selectedColor?: string
    selectedBackgroundColor?: string
    showBorder?: boolean
}

export const BaseButtonGroupHorizontal = ({
    action,
    selectedButtonIds,
    buttons,
    disabled: disableAllButtons,
    typographyFont = "buttonPrimary",
    renderButton,
    style,
    color,
    selectedColor,
    selectedBackgroundColor,
    showBorder = false,
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
            if (selected && selectedBackgroundColor) {
                return selectedBackgroundColor
            }
            if (disabledStatus && selected) {
                return theme.colors.disabled
            }
            if (selected) {
                return theme.colors.horizontalButtonSelected
            }
            return theme.colors.card
        },
        [selectedBackgroundColor, theme.colors.card, theme.colors.disabled, theme.colors.horizontalButtonSelected],
    )

    const calculateTextColor = useCallback(
        (selected: boolean, disabledStatus: boolean | undefined) => {
            if (selected && selectedColor) {
                return selectedColor
            }
            if (disabledStatus) {
                return theme.colors.horizontalButtonTextReversed
            }
            if (selected) {
                return theme.colors.textSecondary
            }
            return color || theme.colors.text
        },
        [
            selectedColor,
            color,
            theme.colors.textSecondary,
            theme.colors.horizontalButtonTextReversed,
            theme.colors.text,
        ],
    )

    return (
        <BaseView
            flexDirection="row"
            alignItems="stretch"
            style={[styles.backgroundStyle, style, showBorder && styles.borderStyle]}>
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
                                    {icon && (
                                        <>
                                            <BaseIcon size={18} name={icon} color={textColor} />
                                            <BaseSpacer width={12} />
                                        </>
                                    )}
                                    <BaseText color={textColor} typographyFont={typographyFont} align="center">
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
            borderRadius: 8,
            padding: 4,
        },
        buttonStyle: {
            borderRadius: 6,
        },
        pressable: {
            padding: 10,
        },
        borderStyle: {
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
        },
    })
