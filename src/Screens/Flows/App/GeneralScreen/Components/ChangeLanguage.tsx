import React from "react"
import { LANGUAGE, useTheme } from "~Common"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"

type Props = {
    language: LANGUAGE
    onPress: () => void
}

export const ChangeLanguage: React.FC<Props> = ({ language, onPress }) => {
    const theme = useTheme()

    return (
        <BaseTouchableBox action={onPress} justifyContent="space-between">
            <BaseText typographyFont="smallButtonPrimary">{language}</BaseText>
            <BaseIcon name={"web"} color={theme.colors.text} size={24} />
        </BaseTouchableBox>
    )
}
