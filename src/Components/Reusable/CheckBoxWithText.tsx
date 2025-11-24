import React, { FC, useCallback } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { LocalizedString } from "typesafe-i18n"
import { BaseIcon, BaseText } from "~Components/Base"
import { COLORS, ColorThemeType, TFonts } from "~Constants"
import { useThemedStyles } from "~Hooks"
import HapticsService from "~Services/HapticsService"

type Props = {
    isChecked: boolean
    font?: TFonts
    fontColor?: string
    checkBoxColor?: string
    text: LocalizedString | string
    checkSize?: number
    testID?: string
    checkAction: (checked: boolean) => void
    checkboxTestID?: string
    style?: StyleProp<ViewStyle>
}

export const CheckBoxWithText: FC<Props> = ({
    font,
    fontColor,
    checkBoxColor,
    text,
    checkSize,
    testID,
    checkAction,
    isChecked,
    checkboxTestID,
    style,
}) => {
    const { styles, theme } = useThemedStyles(baseStyles(checkBoxColor))

    const onPress = useCallback(
        async (checked: boolean) => {
            await HapticsService.triggerImpact({ level: "Light" })
            checkAction(checked)
        },
        [checkAction],
    )

    return (
        <BouncyCheckbox
            onPress={onPress}
            size={checkSize ?? 16}
            unFillColor={COLORS.TRANSPARENT}
            fillColor={theme.colors.checkboxFilledBackground}
            style={style}
            innerIconStyle={styles.innerIcon}
            iconStyle={styles.icon}
            iconComponent={
                isChecked ? (
                    <BaseIcon name="icon-check" size={14} color={checkBoxColor ?? theme.colors.checkboxIcon} />
                ) : (
                    <></>
                )
            }
            isChecked={isChecked}
            testID={checkboxTestID}
            textComponent={
                <BaseText typographyFont={font ? font : "footNote"} color={fontColor} my={14} mx={10} testID={testID}>
                    {text}
                </BaseText>
            }
        />
    )
}

const baseStyles = (checkBoxColor?: string) => (theme: ColorThemeType) =>
    StyleSheet.create({
        innerIcon: {
            color: checkBoxColor ?? theme.colors.text,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: checkBoxColor ?? theme.colors.border,
        },
        icon: {
            borderRadius: 4,
            color: checkBoxColor ?? theme.colors.checkboxIcon,
        },
    })
