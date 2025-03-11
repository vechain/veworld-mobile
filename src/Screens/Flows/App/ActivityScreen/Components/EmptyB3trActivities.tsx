import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type EmptyB3trActivitiesProps = {
    onPress: () => void
}

export const EmptyB3trActivities = ({ onPress }: EmptyB3trActivitiesProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const borderColor = theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200

    return (
        <BaseView style={[styles.rootContainer, { backgroundColor: theme.colors.card, borderColor: borderColor }]}>
            <BaseSpacer height={24} />
            <BaseText style={styles.description} typographyFont="bodySemiBold" color={theme.colors.text}>
                {LL.ACTIVITY_B3TR_EMPTY_LABEL()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseText style={styles.description} typographyFont="subSubTitleLight" color={theme.colors.text}>
                {LL.ACTIVITY_B3TR_EMPTY_DESCRIPTION()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseButton variant="solid" title={LL.ACTIVITY_B3TR_EMPTY_BUTTON()} action={onPress} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            padding: 24,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
        },
        description: {
            textAlign: "center",
        },
    })
