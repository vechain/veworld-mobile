import React from "react"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"
import { Locales } from "~i18n"
import { languages } from "~Model"

type Props = {
    language: Locales
    onPress: () => void
}

export const ChangeLanguage: React.FC<Props> = ({ language, onPress }) => {
    const theme = useTheme()

    const selectedLanguageName = languages.find(_language => _language.code === language)?.name

    return (
        <BaseTouchableBox action={onPress} justifyContent="space-between" haptics="Light">
            <BaseText typographyFont="smallButtonPrimary">{selectedLanguageName}</BaseText>
            <BaseIcon name={"icon-globe"} color={theme.colors.text} size={24} />
        </BaseTouchableBox>
    )
}
