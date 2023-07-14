import React from "react"
import { useTheme } from "~Hooks"
import { LANGUAGE } from "~Constants"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"

type Props = {
    language: LANGUAGE
    onPress: () => void
}

export const ChangeLanguage: React.FC<Props> = ({ language, onPress }) => {
    const theme = useTheme()

    return (
        <BaseTouchableBox
            action={onPress}
            justifyContent="space-between"
            haptics="Light">
            <BaseText typographyFont="smallButtonPrimary">{language}</BaseText>
            <BaseIcon name={"web"} color={theme.colors.text} size={24} />
        </BaseTouchableBox>
    )
}
