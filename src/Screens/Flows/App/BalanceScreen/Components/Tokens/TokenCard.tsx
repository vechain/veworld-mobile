import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, VET, VTHO, VOT3 } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { Chart } from "./Chart"

type Props = {
    token: FungibleTokenWithBalance
}

export const TokenCard = ({ token }: Props) => {
    const navigation = useNavigation()
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const [availableChartWidth, setAvailableChartWidth] = useState<number>()
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

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])

    const { fiatBalance, showFiatBalance, tokenBalance } = useTokenCardBalance({ token })
    const tokenWithCompleteInfo = useTokenWithCompleteInfo(token)

    const chartIcon = useMemo(() => {
        if (!chartData || !showFiatBalance) return null

        const hasSpaceForChart = availableChartWidth ? availableChartWidth >= 110 : true

        // Show icon if there's no space for chart (since any token with fiat balance supports charts)
        const shouldShowIcon = !hasSpaceForChart

        if (!shouldShowIcon) return null

        return (
            <BaseIcon
                name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                size={16}
                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                testID="TOKEN_CARD_CHART_ICON"
            />
        )
    }, [isGoingUp, availableChartWidth, chartData, showFiatBalance])

    const symbol = useMemo(() => {
        switch (token.symbol) {
            case "B3TR":
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500} testID="TOKEN_CARD_SYMBOL_1">
                            {B3TR.symbol}
                        </BaseText>
                        <BaseIcon name="icon-arrow-left-right" size={12} color={COLORS.GREY_300} />
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500} testID="TOKEN_CARD_SYMBOL_2">
                            {VOT3.symbol}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
            default:
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="bodySemiBold" color={COLORS.GREY_500} testID="TOKEN_CARD_SYMBOL">
                            {token.symbol}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
        }
    }, [chartIcon, token.symbol])

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])

    const onLayoutChange = useCallback(
        (event: LayoutChangeEvent) => {
            const { width } = event.nativeEvent.layout
            // p={16}*2 + iconSize={40} + gap={16} + gap={8} + balance(~100px estimated)
            const estimatedFixedSpace = 32 + 40 + 16 + 8 + 100 // ~196px
            const availableSpace = width - estimatedFixedSpace

            if (Math.abs((availableChartWidth || 0) - availableSpace) > 5) {
                setAvailableChartWidth(availableSpace)
            }
        },
        [availableChartWidth],
    )

    // Only allow navigation for tokens with detailed information available
    const supportsDetailNavigation = useMemo(
        () => [B3TR.symbol, VET.symbol, VTHO.symbol].includes(token.symbol),
        [token.symbol],
    )

    const handlePress = useCallback(() => {
        if (!supportsDetailNavigation) {
            return
        }

        navigation.navigate(Routes.TOKEN_DETAILS, {
            token: tokenWithCompleteInfo,
        })
    }, [navigation, tokenWithCompleteInfo, supportsDetailNavigation])

    return (
        <BaseTouchableBox
            action={supportsDetailNavigation ? handlePress : undefined}
            py={24}
            flexDirection="row"
            bg={COLORS.WHITE}
            containerStyle={styles.root}
            onLayout={onLayoutChange}>
            <BaseView flexDirection="row" gap={16} flex={1}>
                <TokenImage
                    icon={token.icon}
                    isVechainToken={AddressUtils.compareAddresses(VET.address, token.address)}
                    iconSize={40}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {symbol ? (
                    <BaseView flexDirection="column" flex={1}>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={COLORS.GREY_800}
                            flexDirection="row"
                            numberOfLines={1}
                            flex={1}
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        {symbol}
                    </BaseView>
                ) : (
                    <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.GREY_800} flexDirection="row">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <Chart token={token} availableWidth={availableChartWidth} />

            <BaseView flexDirection="column" alignItems="flex-end" flexShrink={0}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={COLORS.GREY_800}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="TOKEN_CARD_FIAT_BALANCE">
                            {fiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={COLORS.GREY_500}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="TOKEN_CARD_TOKEN_BALANCE">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText
                        typographyFont="subSubTitleSemiBold"
                        color={COLORS.GREY_800}
                        align="right"
                        numberOfLines={1}
                        flexDirection="row"
                        testID="TOKEN_CARD_TOKEN_BALANCE">
                        {tokenBalance}
                    </BaseText>
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: 80,
        },
    })
