import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { StargateSVG } from "~Assets/IconComponents"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { useI18nContext } from "~i18n"

type EmptyActivityListProps = {
    icon?: IconKey
    label: string
    description?: string
    hasCardStyle?: boolean
    onPress?: () => void
}

const useEmptyActivityColors = (isDark: boolean, hasCardStyle: boolean) => {
    return useMemo(
        () => ({
            icon: isDark ? COLORS.WHITE : COLORS.GREY_400,
            label: isDark ? (hasCardStyle ? COLORS.WHITE : COLORS.GREY_600) : COLORS.PRIMARY_800,
            description: isDark ? (hasCardStyle ? COLORS.WHITE : COLORS.GREY_400) : COLORS.GREY_800,
            cardBackground: isDark ? COLORS.PURPLE : COLORS.WHITE,
        }),
        [isDark, hasCardStyle],
    )
}

export const EmptyActivityList = React.memo<EmptyActivityListProps>(
    ({ icon, label, description, hasCardStyle = false, onPress }) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const colors = useEmptyActivityColors(theme.isDark, hasCardStyle)

        const containerStyle = useMemo(
            () => [
                styles.rootContainer,
                hasCardStyle && styles.cardContainer,
                hasCardStyle && { backgroundColor: colors.cardBackground },
            ],
            [styles.rootContainer, styles.cardContainer, hasCardStyle, colors.cardBackground],
        )

        const iconContainerStyle = useMemo(
            () => [styles.iconContainer, { backgroundColor: theme.colors.card }],
            [styles.iconContainer, theme.colors.card],
        )

        const { LL } = useI18nContext()

        return (
            <BaseView style={containerStyle}>
                {icon ? (
                    <BaseIcon name={icon} size={32} style={iconContainerStyle} color={colors.icon} />
                ) : (
                    <StargateSVG currentColor={colors.label} />
                )}

                <BaseSpacer height={24} />

                <BaseText typographyFont="captionSemiBold" color={colors.label} align="center">
                    {label}
                </BaseText>

                {description && (
                    <>
                        <BaseSpacer height={8} />
                        <BaseText typographyFont="captionRegular" color={colors.description} align="center">
                            {description}
                        </BaseText>
                    </>
                )}

                {onPress && (
                    <>
                        <BaseSpacer height={24} />
                        <BaseButton variant="solid" title={LL.ACTIVITY_STAKING_EMPTY_BUTTON()} action={onPress} />
                    </>
                )}
            </BaseView>
        )
    },
)

EmptyActivityList.displayName = "EmptyActivityList"

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        cardContainer: {
            padding: 32,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 16,
            alignSelf: "stretch",
            borderRadius: 12,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
        },
    })
