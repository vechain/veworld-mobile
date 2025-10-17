import React from "react"
import { StyleSheet } from "react-native"
import { BaseText } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Utils"

export const AVAILABLE_CATEGORIES = [
    "others",
    "education-learning",
    "fitness-wellness",
    "green-finance-defi",
    "green-mobility-travel",
    "nutrition",
    "plastic-waste-recycling",
    "renewable-energy-efficiency",
    "sustainable-shopping",
    "pets",
] as const

export const CategoryChip = ({ category }: { category: (typeof AVAILABLE_CATEGORIES)[number] }) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseText
            px={8}
            py={4}
            typographyFont="smallCaptionMedium"
            color={COLORS.WHITE}
            bg={COLORS.WHITE_RGBA_15}
            containerStyle={styles.root}
            testID="CATEGORY_CHIP">
            {LL[`DAPP_CATEGORY_${StringUtils.toUppercase(StringUtils.replaceCharacter(category, "-", "_"))}`]()}
        </BaseText>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 4,
        },
    })
