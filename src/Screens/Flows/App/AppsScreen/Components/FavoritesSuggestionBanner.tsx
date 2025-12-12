import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

const FavoriteEmptySlot = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView testID="FavoritesSuggestionBanner_EmptySlot" style={styles.emptySlot}>
            <BaseIcon name="icon-plus" size={12} color={theme.colors.favoritesSuggestionBanner.emptySlot.color} />
        </BaseView>
    )
}

type Props = {
    onPress: () => void
}

export const FavoritesSuggestionBanner = ({ onPress }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseTouchable
            testID="FavoritesSuggestionBanner"
            style={styles.root}
            activeOpacity={0.8}
            onPress={onPress}
            haptics="Light">
            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start" gap={12} flex={1}>
                <BaseIcon name="icon-star" size={16} color={theme.colors.favoritesSuggestionBanner.iconColor} />
                <BaseText
                    testID="FavoritesSuggestionBanner_Title"
                    typographyFont="captionSemiBold"
                    color={theme.colors.favoritesSuggestionBanner.color}>
                    {LL.FAVORITES_SUGGESTION_BANNER_TITLE()}
                </BaseText>
            </BaseView>
            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-end" gap={4}>
                <FavoriteEmptySlot />
                <FavoriteEmptySlot />
                <FavoriteEmptySlot />
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.colors.favoritesSuggestionBanner.background,
            padding: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.colors.favoritesSuggestionBanner.border,
            marginHorizontal: 16,
        },
        emptySlot: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.colors.favoritesSuggestionBanner.emptySlot.border,
            backgroundColor: theme.colors.favoritesSuggestionBanner.emptySlot.background,
        },
    })
