import { StyleSheet, TouchableOpacity, ViewProps } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseSpacer, BaseText, BaseView, FiatBalance } from "~Components"
import { TokenWithCompleteInfo, useBalances, useTheme, useThemedStyles } from "~Hooks"
import { B3TR, ColorThemeType, VOT3 } from "~Constants"
import { TokenImage } from "../TokenImage"
import { selectBalanceVisible, useAppSelector } from "~Storage/Redux"
import { FungibleToken } from "~Model"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"

type OfficialTokenCardProps = {
    token: FungibleToken
    tokenWithInfo?: Partial<TokenWithCompleteInfo>
    action: () => void
    selected?: boolean
}

export const OfficialTokenCard = memo(
    ({ token, tokenWithInfo = {}, style, action, selected }: OfficialTokenCardProps & ViewProps) => {
        const { styles } = useThemedStyles(baseStyles(selected))
        const theme = useTheme()
        const isVOT3 = token.symbol === VOT3.symbol
        const isVeB3tr = token.symbol === B3TR.symbol || token.symbol === VOT3.symbol

        const isBalanceVisible = useAppSelector(selectBalanceVisible)
        const { data: exchangeRate } = useVechainStatsTokenInfo(token.symbol.toLowerCase())

        const { formatValue } = useFormatFiat()
        const { tokenInfo } = tokenWithInfo
        const isPositive24hChange = (tokenInfo?.market_data?.price_change_percentage_24h ?? 0) >= 0

        const change24h =
            (isPositive24hChange ? "+" : "") +
            formatValue(tokenInfo?.market_data?.price_change_percentage_24h ?? 0) +
            "%"

        const { tokenUnitBalance, fiatBalance: tokenFiatBalance } = useBalances({
            token,
            exchangeRate: tokenWithInfo?.exchangeRate ?? parseFloat(exchangeRate ?? "0"),
        })

        const symbol = useMemo(() => tokenWithInfo.symbol ?? token?.symbol, [tokenWithInfo.symbol, token?.symbol])

        const isBetterToken = useMemo(() => {
            return token.symbol === B3TR.symbol || token.symbol === VOT3.symbol
        }, [token.symbol])

        const fiatBalance = useMemo(() => {
            if (tokenWithInfo?.fiatBalance && !isVOT3) return tokenWithInfo.fiatBalance
            return tokenFiatBalance
        }, [isVOT3, tokenFiatBalance, tokenWithInfo.fiatBalance])

        return (
            <TouchableOpacity onPress={action} style={[styles.container, style]} testID={symbol}>
                <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                    <BaseView flexDirection="row" justifyContent="flex-start">
                        <TokenImage icon={token.icon} symbol={token.symbol} isLogoRound={isVeB3tr} />
                        <BaseSpacer width={14} />
                        <BaseView flexDirection="row">
                            <BaseText typographyFont="bodyBold" ellipsizeMode="tail" numberOfLines={1}>
                                {token.symbol}
                            </BaseText>
                            <BaseSpacer width={6} />

                            <BaseText typographyFont="bodyMedium" color={theme.colors.tokenCardText}>
                                {isBalanceVisible ? tokenUnitBalance : "•••••"}
                            </BaseText>
                        </BaseView>
                    </BaseView>

                    {!!exchangeRate && (
                        <BaseView style={styles.balanceInfo}>
                            {!!exchangeRate && (
                                <FiatBalance
                                    typographyFont="bodyBold"
                                    color={theme.colors.assetDetailsCard.title}
                                    balances={[fiatBalance]}
                                    isVisible={isBalanceVisible}
                                />
                            )}
                            {!!tokenInfo && !isBetterToken && (
                                <BaseView flexDirection="row">
                                    <BaseText
                                        typographyFont="captionMedium"
                                        color={isPositive24hChange ? theme.colors.positive : theme.colors.negative}>
                                        {change24h}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                    )}
                </BaseView>
            </TouchableOpacity>
        )
    },
)

const baseStyles = (selected?: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 72,
            justifyContent: "center",
            marginBottom: 8,
            paddingHorizontal: 16,
            borderWidth: selected ? 1 : 0,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.text,
        },
        balanceInfo: {
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 2,
        },
    })
