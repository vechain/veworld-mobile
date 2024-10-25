import React from "react"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"

export const DoNotShareAlert = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseCard containerStyle={styles.alertCardContainer}>
            <BaseView w={100}>
                <BaseView flexDirection="row">
                    <BaseIcon name="alert-outline" size={16} color={theme.colors.alertCards.error.icon} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="bodyMedium" color={theme.colors.alertCards.error.title}>
                        {LL.ALERT_TITLE_DONT_SHARE_MNEMONIC()}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={4} />
                <BaseText typographyFont="captionRegular" color={theme.colors.alertDescription} pl={24}>
                    {LL.ALERT_MSG_DONT_SHARE_MNEMONIC()}
                </BaseText>
            </BaseView>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        alertCardContainer: {
            backgroundColor: theme.colors.alertCards.error.background,
            borderColor: theme.colors.alertCards.error.border,
            borderRadius: 8,
            paddingLeft: 2,
            paddingRight: 4,
        },
    })
