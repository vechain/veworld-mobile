import { TouchableOpacity as BottomSheetTouchable } from "@gorhom/bottom-sheet"
import React, { useMemo } from "react"
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseIcon } from "../BaseIcon"
import { BaseText } from "../BaseText"
import { BaseView } from "../BaseView"

type Props = {
    id: string
    label: string
    isSelected: boolean
    testID?: string
    disabled?: boolean
    isBottomSheet?: boolean
    onPress: (id: string) => void
    contentStyle?: ViewStyle
    labelStyle?: TextStyle
    numberOfLines?: number
}

export const BaseRadioButton = ({
    id,
    label,
    isSelected,
    disabled,
    testID,
    isBottomSheet,
    onPress,
    contentStyle,
    labelStyle,
    numberOfLines,
}: Props) => {
    const { styles, theme } = useThemedStyles(_theme => baseStyles(_theme, isSelected))

    const computeContainerStyles = useMemo(() => {
        if (disabled) return [styles.rootContainer, styles.disabledContainer]

        return [styles.rootContainer]
    }, [disabled, styles.disabledContainer, styles.rootContainer])

    const computedTextStyles = useMemo(() => {
        if (disabled) return [styles.text, styles.textDisabled]

        return [styles.text]
    }, [disabled, styles.text, styles.textDisabled])

    const iconColor = useMemo(() => {
        if (disabled) return theme.colors.radioButton.disabledTextColor
        if (isSelected) return theme.colors.radioButton.activeTextColor

        return theme.colors.radioButton.textColor
    }, [
        disabled,
        isSelected,
        theme.colors.radioButton.activeTextColor,
        theme.colors.radioButton.disabledTextColor,
        theme.colors.radioButton.textColor,
    ])

    const Touchable = isBottomSheet ? BottomSheetTouchable : TouchableOpacity

    return (
        <Touchable
            testID={testID}
            disabled={disabled}
            style={computeContainerStyles}
            accessibilityValue={{ text: isSelected ? "selected" : "not selected" }}
            onPress={() => onPress(id)}>
            <BaseView flexDirection={"row"} justifyContent={"space-between"} style={contentStyle}>
                <BaseText
                    typographyFont="bodyMedium"
                    style={[computedTextStyles, labelStyle]}
                    lineHeight={20}
                    numberOfLines={numberOfLines}>
                    {label}
                </BaseText>
                <BaseIcon
                    name={isSelected ? "icon-radio-selected" : "icon-radio-default"}
                    color={iconColor}
                    size={16}
                    px={0}
                    py={0}
                    p={0}
                />
            </BaseView>
        </Touchable>
    )
}

const baseStyles = (theme: ColorThemeType, isSelected: boolean) =>
    StyleSheet.create({
        rootContainer: {
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: isSelected ? 2 : 1,
            borderRadius: 8,
            backgroundColor: theme.colors.radioButton.backgroudColor,
            borderColor: isSelected ? theme.colors.radioButton.activeBorderColor : theme.colors.radioButton.borderColor,
        },
        disabledContainer: {
            backgroundColor: theme.colors.radioButton.disabledBackgroudColor,
            borderColor: theme.colors.radioButton.borderColor,
        },
        text: {
            color: isSelected ? theme.colors.radioButton.activeTextColor : theme.colors.radioButton.textColor,
        },
        textDisabled: {
            color: theme.colors.radioButton.disabledTextColor,
        },
    })
