import React from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

export const IsBackedupAlert = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.alertInlineContainer}>
            <BaseView w={100}>
                <BaseView flexDirection="row">
                    <BaseIcon name="check-circle-outline" size={16} color={theme.colors.alertCards.success.icon} />
                    <BaseSpacer width={12} />
                    <BaseText typographyFont="captionRegular" color={theme.colors.alertCards.success.title}>
                        {LL.ALERT_LAST_BACKUP_TIME()}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        alertInlineContainer: {
            backgroundColor: theme.colors.alertCards.success.background,
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
    })
