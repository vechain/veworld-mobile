import React, { FC } from "react"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { BaseText } from "~Components/Base"
import { TFonts, useTheme } from "~Common"
import { LocalizedString } from "typesafe-i18n"

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
            fillColor={theme.colors.button}
            textComponent={
                <BaseText
                    font={font ?? "footnote"}
                    color={fontColor}
                    my={14}
                    mx={10}>
                    {text}
                </BaseText>
            }
        />
    )
}
