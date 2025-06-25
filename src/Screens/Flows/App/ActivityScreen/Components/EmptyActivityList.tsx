import React from "react"
import { Image, ImageStyle, StyleSheet } from "react-native"
import { StargatePlaceholder } from "~Assets/Img"
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

export const EmptyActivityList = ({ icon, label, description, hasCardStyle, onPress }: EmptyActivityListProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const iconColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_400
    const labelColor = theme.isDark ? COLORS.WHITE : hasCardStyle ? COLORS.PRIMARY_800 : COLORS.GREY_600
    const descriptionColor = theme.isDark ? COLORS.WHITE : hasCardStyle ? COLORS.GREY_800 : COLORS.GREY_400

    return (
        <BaseView style={[styles.rootContainer, hasCardStyle && styles.cardContainer]}>
            {icon ? (
                <BaseIcon
                    name={icon}
                    size={32}
                    style={[styles.iconContainer, { backgroundColor: theme.colors.card }]}
                    color={iconColor}
                />
            ) : (
                <Image source={StargatePlaceholder} style={styles.image as ImageStyle} resizeMode="contain" />
            )}
            <BaseSpacer height={24} />
            <BaseText typographyFont="captionSemiBold" color={labelColor} align="center">
                {label}
            </BaseText>
            <BaseText typographyFont="captionRegular" color={descriptionColor} align="center">
                {description}
            </BaseText>
            <BaseSpacer height={24} />
            {onPress && <BaseButton variant="solid" title={LL.ACTIVITY_STAKING_EMPTY_BUTTON()} action={onPress} />}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        image: {
            width: 129,
            height: 24,
        },
        cardContainer: {
            padding: 32,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 16,
            alignSelf: "stretch",
            borderRadius: 12,
            backgroundColor: COLORS.WHITE,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
        },
    })
