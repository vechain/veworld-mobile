import React from "react"
import { StyleSheet } from "react-native"
import { StargateSVG } from "~Assets"
import { BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type EmptyB3trActivitiesProps = {
    onPress: () => void
}

export const EmptyStakingActivities = ({ onPress }: EmptyB3trActivitiesProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const borderColor = theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200

    return (
        <BaseView style={[styles.rootContainer, { backgroundColor: theme.colors.card, borderColor: borderColor }]}>
            <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                <StargateSVG currentColor={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseText
                style={styles.description}
                typographyFont="captionSemiBold"
                color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_800}>
                {LL.ACTIVITY_ALL_EMPTY_LABEL()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseText
                style={styles.description}
                typographyFont="captionRegular"
                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
                {LL.ACTIVITY_STAKING_EMPTY_LABEL()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseButton
                variant="solid"
                title={LL.ACTIVITY_STAKING_EMPTY_BUTTON()}
                action={onPress}
                typographyFont="bodySemiBold"
            />
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
