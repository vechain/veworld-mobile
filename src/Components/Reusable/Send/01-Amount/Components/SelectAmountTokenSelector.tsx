import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"

type Props = {
    onOpenSelector: () => void
    onMaxPress: () => void
    token: FungibleTokenWithBalance
}

export const SelectAmountTokenSelector = React.memo<Props>(function TokenSelectorButton({
    onOpenSelector,
    onMaxPress,
    token,
}) {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const tokenAmountCard = theme.colors.sendScreen.tokenAmountCard

    const { formatLocale } = useFormatFiat()

    const tokenBalance = useMemo(() => {
        if (!token) return ""
        const humanBalance = BigNutils(token.balance.balance).toHuman(token.decimals ?? 0)
        return formatFullPrecision(humanBalance.toString, {
            locale: formatLocale,
            tokenSymbol: token.symbol,
        })
    }, [formatLocale, token])

    const computedIcon = useMemo(() => {
        if (!token) return VET.icon
        if (token.symbol === VET.symbol) return VET.icon
        if (token.symbol === VTHO.symbol) return VTHO.icon
        if (token.symbol === B3TR.symbol) return B3TR.icon
        if (token.symbol === VOT3.symbol) return VOT3.icon
        return token.icon
    }, [token])

    return (
        <TouchableOpacity testID="SelectAmountTokenSelector_Button" onPress={onOpenSelector}>
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
