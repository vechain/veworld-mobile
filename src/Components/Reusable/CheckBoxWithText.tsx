import React, { FC } from "react"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { BaseText } from "~Components/Base"
import { useTheme } from "~Hooks"
import { LocalizedString } from "typesafe-i18n"
import { TFonts } from "~Constants"

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

    return (
        <BouncyCheckbox
            onPress={checkAction}
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
