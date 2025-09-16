import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, VET, VOT3 } from "~Constants"
import { useBalances, useCombineFiatBalances, useFormatFiat, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils } from "~Utils"

type Props = {
    token: FungibleTokenWithBalance
}

export const TokenCard = ({ token }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const name = useMemo(() => {
        switch (token.symbol) {
            case "VET":
                return "VeChain"
            case "VTHO":
                return "VeThor"
            case "B3TR":
                return "VeBetter"
            case "VOT3":
                return "VeBetter"
            case "veB3TR":
                return "veDelegate"
            default:
                return token.name
        }
    }, [token.name, token.symbol])

    const symbol = useMemo(() => {
        switch (token.symbol) {
            case "B3TR":
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500}>
                            {B3TR.symbol}
                        </BaseText>
                        <BaseIcon name="icon-arrow-left-right" size={12} color={COLORS.GREY_300} />
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500}>
                            {VOT3.symbol}
                        </BaseText>
                    </BaseView>
                )
            case "veB3TR":
                return null
            default:
                return (
                    <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500}>
                        {token.symbol}
                    </BaseText>
                )
        }
    }, [token.symbol])

    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[token.symbol]
        if (coingeckoId) return coingeckoId
        if (token.symbol === "veB3TR") return getCoinGeckoIdBySymbol[B3TR.symbol]
        return token.symbol
    }, [token.symbol])

    const { data: exchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: exchangeRateId,
    })

    const { fiatBalance: fiatBalance } = useBalances({
        token,
        exchangeRate: exchangeRate ?? 0,
    })

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(
        () => combineFiatBalances([fiatBalance]),
        [combineFiatBalances, fiatBalance],
    )

    const { formatFiat, formatLocale } = useFormatFiat()
    const renderFiatBalance = useMemo(
        () => formatFiat({ amount, cover: token.balance.isHidden }),
        [formatFiat, amount, token.balance.isHidden],
    )

    const tokenBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token.balance.balance, token.decimals ?? 0, 2, formatLocale),
        [formatLocale, token.balance.balance, token.decimals],
    )

    const showFiatBalance = useMemo(() => {
        return !!exchangeRate
    }, [exchangeRate])

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])

    return (
        <BaseView flexDirection="row" p={16} bg={COLORS.WHITE} borderRadius={12} style={styles.root}>
            <TokenImage
                icon={token.icon}
                isVechainToken={AddressUtils.compareAddresses(VET.address, token.address)}
                iconSize={32}
                isCrossChainToken={isCrossChainToken}
                rounded={!isCrossChainToken}
            />
            <BaseSpacer width={16} />

            {symbol ? (
                <>
                    <BaseView flexDirection="column">
                        <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800}>
                            {name}
                        </BaseText>
                        {symbol}
                    </BaseView>
                </>
            ) : (
                <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800}>
                    {name}
                </BaseText>
            )}

            <BaseView flexDirection="column" style={styles.price}>
                {showFiatBalance ? (
                    <>
                        <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800} align="right">
                            {areAlmostZero && token.balance.isHidden && "< "}
                            {renderFiatBalance}
                        </BaseText>
                        <BaseText typographyFont="bodyMedium" color={COLORS.GREY_500} align="right">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800} align="right">
                        {tokenBalance}
                    </BaseText>
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: 80,
        },
        price: {
            marginLeft: "auto",
        },
    })
