import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, VET, VOT3 } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CAN_DISPLAY_CHART, Chart, getPriceChange } from "./Chart"

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

    const { data: chartData } = useSmartMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => getPriceChange(chartData) >= 0, [chartData])

    const chartIcon = useMemo(() => {
        if (!chartData || CAN_DISPLAY_CHART) return null
        return (
            <BaseIcon
                name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                size={16}
                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
            />
        )
    }, [chartData, isGoingUp])

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
                        {chartIcon}
                    </BaseView>
                )
            case "veB3TR":
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500}>
                            {"veDelegate"}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
            default:
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500}>
                            {token.symbol}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
        }
    }, [chartIcon, token.symbol])

    const { fiatBalance, showFiatBalance, tokenBalance } = useTokenCardBalance({ token })

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])

    return (
        <BaseView flexDirection="row" p={16} bg={COLORS.WHITE} borderRadius={12} style={styles.root} gap={8}>
            <BaseView flexDirection="row" gap={16} flex={1}>
                <TokenImage
                    icon={token.icon}
                    isVechainToken={AddressUtils.compareAddresses(VET.address, token.address)}
                    iconSize={40}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {symbol ? (
                    <>
                        <BaseView flexDirection="column" flex={1}>
                            <BaseText
                                typographyFont="subSubTitleSemiBold"
                                color={COLORS.GREY_800}
                                flexDirection="row"
                                numberOfLines={1}
                                flex={1}>
                                {name}
                            </BaseText>
                            {symbol}
                        </BaseView>
                    </>
                ) : (
                    <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800} flexDirection="row">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <Chart token={token} />

            <BaseView flexDirection="column" style={styles.price} alignItems="flex-end" flexShrink={0}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={COLORS.GREY_800}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row">
                            {fiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={COLORS.GREY_500}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText
                        typographyFont="subSubTitleSemiBold"
                        color={COLORS.GREY_800}
                        align="right"
                        numberOfLines={1}
                        flexDirection="row">
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
            // marginLeft: "auto",
        },
    })
