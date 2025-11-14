import React from "react"
import { useThemedStyles } from "~Hooks"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"
import { Locales } from "~i18n"
import { languages } from "~Model"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    language: Locales
    onPress: () => void
}

export const ChangeLanguage: React.FC<Props> = ({ language, onPress }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedLanguageName = languages.find(_language => _language.code === language)?.name

    return (
        <BaseTouchableBox
            action={onPress}
            justifyContent="space-between"
            haptics="Light"
            containerStyle={styles.container}>
            <BaseText typographyFont="captionMedium" color={theme.colors.subSubtitle}>
                {selectedLanguageName}
            </BaseText>
            <BaseIcon name={"icon-chevron-down"} color={theme.isDark ? COLORS.GREY_400 : COLORS.GREY_500} size={24} />
        </BaseTouchableBox>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
        },
    })
