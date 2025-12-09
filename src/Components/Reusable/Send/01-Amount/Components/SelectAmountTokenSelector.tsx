import React from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { ColorThemeType } from "~Constants/Theme"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    computedIcon: string
    tokenBalance: string
    onOpenSelector: () => void
    onMaxPress: () => void
}

export const SelectAmountTokenSelector = React.memo<Props>(function TokenSelectorButton({
    computedIcon,
    tokenBalance,
    onOpenSelector,
    onMaxPress,
}) {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const tokenAmountCard = theme.colors.sendScreen.tokenAmountCard

    return (
        <TouchableOpacity onPress={onOpenSelector}>
            <BaseView style={styles.tokenSelector} mx={18}>
                <BaseView flexDirection="row" alignItems="center" gap={8}>
                    <BaseIcon name="icon-chevrons-up-down" size={16} color={tokenAmountCard.tokenSelectIcon} />
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <TokenImage icon={computedIcon} iconSize={24} rounded={true} />
                        <BaseText typographyFont="bodySemiBold" color={tokenAmountCard.tokenSelectorText}>
                            {tokenBalance}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseTouchable action={onMaxPress} style={styles.maxButton}>
                    <BaseText typographyFont="captionSemiBold" color={tokenAmountCard.maxButtonText}>
                        {LL.COMMON_MAX()}
                    </BaseText>
                </BaseTouchable>
            </BaseView>
        </TouchableOpacity>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tokenSelector: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.tokenSelectorBorder,
            backgroundColor: theme.colors.card,
        },
        maxButton: {
            paddingHorizontal: 18,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.maxButtonBorder,
        },
    })
