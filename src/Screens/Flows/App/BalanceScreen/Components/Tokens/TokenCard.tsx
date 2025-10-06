import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, VET, VOT3, VTHO } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
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
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const [showChart, setShowChart] = useState(true)
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
        if (!chartData || !showFiatBalance || showChart) return null

        return (
            <BaseIcon
                name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                size={16}
                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                testID="TOKEN_CARD_CHART_ICON"
            />
        )
    }, [chartData, showFiatBalance, showChart, isGoingUp])

    const symbol = useMemo(() => {
        switch (token.symbol) {
            case "B3TR":
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            testID="TOKEN_CARD_SYMBOL_1">
                            {B3TR.symbol}
                        </BaseText>
                        <BaseIcon
                            name="icon-arrow-left-right"
                            size={12}
                            color={theme.colors.activityCard.subtitleLight}
                        />
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            testID="TOKEN_CARD_SYMBOL_2">
                            {VOT3.symbol}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
            default:
                return (
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            testID="TOKEN_CARD_SYMBOL">
                            {token.symbol}
                        </BaseText>
                        {chartIcon}
                    </BaseView>
                )
        }
    }, [chartIcon, token.symbol, theme.colors.activityCard.subtitleLight])

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])

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
            py={18}
            flexDirection="row"
            bg={theme.colors.card}
            containerStyle={styles.root}>
            <BaseView flexDirection="row" gap={16} flex={1}>
                <TokenImage
                    icon={token.icon}
                    isVechainToken={AddressUtils.isVechainToken(token.address)}
                    iconSize={40}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {symbol ? (
                    <BaseView flexDirection="column" flex={1}>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            numberOfLines={1}
                            flex={1}
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        {symbol}
                    </BaseView>
                ) : (
                    <BaseText
                        typographyFont="subSubTitleSemiBold"
                        color={theme.colors.activityCard.title}
                        flexDirection="row">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <Chart token={token} showChart={showChart} setShowChart={setShowChart} />

            <BaseView flexDirection="column" alignItems="flex-end" flexShrink={0}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={theme.colors.activityCard.title}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="TOKEN_CARD_FIAT_BALANCE">
                            {fiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={theme.colors.activityCard.subtitleLight}
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
                        color={theme.colors.activityCard.title}
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
            gap: 16,
        },
    })
