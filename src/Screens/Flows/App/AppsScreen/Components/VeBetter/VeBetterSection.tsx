import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { X2ECategoryType } from "~Model/DApp"
import { useCategories } from "./Hooks"

type Props = {
    title: string
    icon: IconKey
    action: () => void
}

type Category = {
    id: X2ECategoryType
    displayName: string
    icon: IconKey
}

const VeBetterCategoryButton = React.memo(({ title, icon, action }: Props) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseTouchable action={action} haptics="Light" style={styles.container}>
            <BaseIcon name={icon} size={32} color={theme.colors.veBetterCategoryButton.icon} />
            <BaseText typographyFont="captionSemiBold" color={theme.colors.veBetterCategoryButton.title}>
                {title}
            </BaseText>
        </BaseTouchable>
    )
})

type VeBetterCategoryListProps = {
    categories: Category[]
    onPressCategory?: (categoryId: X2ECategoryType) => void
}

const VeBetterCategoryList = React.memo(({ categories, onPressCategory }: VeBetterCategoryListProps) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <ScrollView horizontal contentContainerStyle={styles.root} showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
                <VeBetterCategoryButton
                    key={category.id}
                    title={category.displayName}
                    icon={category.icon}
                    action={() => onPressCategory?.(category.id)}
                />
            ))}
        </ScrollView>
    )
})

type VeBetterSectionProps = {
    onPressCategory: (categoryId: X2ECategoryType) => void
}

export const VeBetterSection = ({ onPressCategory }: VeBetterSectionProps) => {
    const { LL } = useI18nContext()
    const categories = useCategories()

    return (
        <BaseView gap={16} justifyContent="flex-start" alignItems="flex-start">
            <BaseText mx={16} typographyFont="subSubTitleSemiBold">
                {LL.TITLE_VEBETTER()}
            </BaseText>
            <VeBetterCategoryList categories={categories} onPressCategory={onPressCategory} />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 112,
            borderWidth: 1,
            borderColor: theme.colors.veBetterCategoryButton.border,
            backgroundColor: theme.colors.veBetterCategoryButton.background,
            padding: 16,
            gap: 16,
            borderRadius: 12,
        },
        root: {
            gap: 8,
            paddingHorizontal: 16,
        },
    })
