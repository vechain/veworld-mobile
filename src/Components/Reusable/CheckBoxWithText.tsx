import React, { FC, useCallback } from "react"
import { StyleSheet } from "react-native"
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
    text: LocalizedString | string
    checkSize?: number
    testID?: string
    checkAction: (checked: boolean) => void
    checkboxTestID?: string
}

export const CheckBoxWithText: FC<Props> = ({
    font,
    fontColor,
    text,
    checkSize,
    testID,
    checkAction,
    isChecked,
    checkboxTestID,
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)

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
            innerIconStyle={styles.innerIcon}
            iconStyle={styles.icon}
            iconComponent={
                isChecked ? <BaseIcon name="icon-check" size={14} color={theme.colors.checkboxIcon} /> : <></>
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        innerIcon: {
            color: theme.colors.text,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        icon: {
            borderRadius: 4,
            color: theme.colors.checkboxIcon,
        },
    })
