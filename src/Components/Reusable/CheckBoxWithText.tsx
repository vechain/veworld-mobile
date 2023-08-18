import React, { FC, useCallback } from "react"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { BaseIcon, BaseText } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { LocalizedString } from "typesafe-i18n"
import { ColorThemeType, TFonts } from "~Constants"
import HapticsService from "~Services/HapticsService"
import { StyleSheet } from "react-native"

type Props = {
    isChecked: boolean
    font?: TFonts
    fontColor?: string
    text: LocalizedString | string
    checkSize?: number
    testID?: string
    checkAction: (checked: boolean) => void
}

export const CheckBoxWithText: FC<Props> = ({
    font,
    fontColor,
    text,
    checkSize,
    testID,
    checkAction,
    isChecked,
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
            size={checkSize ?? 22}
            unfillColor="transparent"
            fillColor="transparent"
            innerIconStyle={styles.innerIcon}
            iconStyle={styles.icon}
            iconComponent={
                isChecked ? (
                    <BaseIcon
                        name="check"
                        size={20}
                        color={theme.colors.text}
                    />
                ) : (
                    <></>
                )
            }
            isChecked={isChecked}
            textComponent={
                <BaseText
                    typographyFont={font ? font : "footNote"}
                    color={fontColor}
                    my={14}
                    mx={10}
                    testID={testID}>
                    {text}
                </BaseText>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        innerIcon: {
            borderColor: theme.colors.text,
            borderRadius: 6,
            color: theme.colors.text,
        },
        icon: {
            borderRadius: 6,
            color: theme.colors.text,
        },
    })
