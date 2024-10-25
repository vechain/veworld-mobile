import { StyleSheet, ViewStyle } from "react-native"
import { BaseCard, BaseView, BaseIcon, BaseText, BaseSpacer } from "~Components"
import React from "react"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"

type Props = {
    containerStyle?: ViewStyle
    cardStyle?: ViewStyle
    iconName: string
    iconSize?: number
    title: string
    titleColor?: string
    children?: React.ReactNode
}

export const IconHeaderCard = ({ containerStyle, cardStyle, iconName, iconSize = 12, title, children }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    return (
        <BaseCard containerStyle={[styles.cardContainer, containerStyle]} style={[styles.card, cardStyle]}>
            <BaseView style={styles.cardHeader}>
                <BaseIcon name={iconName} size={iconSize} style={styles.icon} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="captionMedium" color={theme.colors.text}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseView>
                <BaseSpacer height={12} />
                {children}
            </BaseView>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.colors.cardBorder,
        },
        card: {
            flexDirection: "column",
            padding: 16,
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
        },
        icon: {
            backgroundColor: COLORS.GREY_200,
            color: COLORS.GREY_600,
            height: 24,
            width: 24,
            borderRadius: 4.5,
        },
    })
