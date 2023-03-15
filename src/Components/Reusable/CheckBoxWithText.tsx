import React, { FC } from "react"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { BaseText } from "~Components/Base"
import { useTheme } from "~Common"
import { LocalizedString } from "typesafe-i18n"
import { TFonts } from "~Common/Theme"

type Props = {
    font?: TFonts
    fontColor?: string
    text: LocalizedString | string
    checkSize?: number
    checkAction: (checked: boolean) => void
}

export const CheckBoxWithText: FC<Props> = ({
    font,
    fontColor,
    text,
    checkSize,
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
                    mx={10}>
                    {text}
                </BaseText>
            }
        />
    )
}
