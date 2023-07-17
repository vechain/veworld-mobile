import React, { FC, useCallback } from "react"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { BaseText } from "~Components/Base"
import { useTheme } from "~Hooks"
import { LocalizedString } from "typesafe-i18n"
import { TFonts } from "~Constants"
import HapticsService from "~Services/HapticsService"

type Props = {
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
}) => {
    const theme = useTheme()

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
            fillColor={theme.colors.primary}
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
