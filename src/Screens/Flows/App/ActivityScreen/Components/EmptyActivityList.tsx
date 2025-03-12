import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type EmptyActivityListProps = {
    icon: IconKey
    label: string
}

export const EmptyActivityList = ({ icon, label }: EmptyActivityListProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const iconColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_400
    const labelColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_600

    return (
        <BaseView style={styles.rootContainer}>
            <BaseIcon
                name={icon}
                size={32}
                style={[styles.iconContainer, { backgroundColor: theme.colors.card }]}
                color={iconColor}
            />
            <BaseSpacer height={24} />
            <BaseText typographyFont="subSubTitleLight" color={labelColor}>
                {label}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
        },
    })
