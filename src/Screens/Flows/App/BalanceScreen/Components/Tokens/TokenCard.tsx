import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, isSmallScreen, typography, VET, VOT3, VTHO } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { selectBalanceVisible, selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { Chart, CHART_WIDTH } from "./Chart"

type Props = {
    token: FungibleTokenWithBalance
}

export const TokenCard = ({ token }: Props) => {
    const navigation = useNavigation()
    const currency = useAppSelector(selectCurrency)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { isLowEndDevice } = useDevice()

    // Check if token supports charts (has CoinGecko ID)
    const isTokenSupported = useMemo(() => !!getCoinGeckoIdBySymbol[token.symbol], [token.symbol])

    // Decide chart visibility based on device/screen size AND token support
    // This ensures ALL token cards show either charts OR indicators consistently
    const shouldShowCharts = useMemo(
        () => !isSmallScreen && !isLowEndDevice && isTokenSupported,
        [isLowEndDevice, isTokenSupported],
    )

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

    const balance = useMemo(() => {
        if (!isBalanceVisible) {
            return "••••••"
        }

        return tokenBalance
    }, [isBalanceVisible, tokenBalance])

    const chartIcon = useMemo(() => {
        // Only show icon on small screens/low-end devices when:
        // 1. Token supports charts (has price data)
        // 2. Fiat balance is visible
        // 3. Chart data is available
        if (!isTokenSupported || !chartData || !showFiatBalance || shouldShowCharts) return null

        return (
            <BaseIcon
                name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                size={16}
                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                testID="TOKEN_CARD_CHART_ICON"
            />
        )
    }, [isTokenSupported, chartData, showFiatBalance, shouldShowCharts, isGoingUp])

    const symbol = useMemo(() => {
        switch (token.symbol) {
            case "B3TR":
                return (
                    <BaseView flexDirection="row" gap={4} overflow="hidden">
                        <BaseText
                            typographyFont="bodySemiBold"
                            numberOfLines={1}
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            testID="TOKEN_CARD_SYMBOL_1">
                            {B3TR.symbol}
                        </BaseText>
                        <BaseIcon
                            name="icon-refresh-cw"
                            size={12}
                            color={theme.isDark ? COLORS.GREY_500 : COLORS.GREY_400}
                        />
                        <BaseText
                            typographyFont="bodySemiBold"
                            numberOfLines={1}
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
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
    }, [chartIcon, token.symbol, theme.colors.activityCard.subtitleLight, theme.isDark])

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])

    // Only allow navigation for tokens with detailed information available
    const isVechainToken = useMemo(() => [B3TR.symbol, VET.symbol, VTHO.symbol].includes(token.symbol), [token.symbol])

    const handlePress = useCallback(() => {
        if (!isVechainToken) {
            if (isCrossChainToken) {
                navigation.navigate(Routes.BRIDGE_TOKEN_DETAILS, {
                    token,
                })
                return
            }

            const isTokenBalance = BalanceUtils.getIsTokenWithBalance(token)

            if (!isTokenBalance) return

            navigation.navigate(Routes.INSERT_ADDRESS_SEND, {
                token,
            })
            return
        }

        navigation.navigate(Routes.TOKEN_DETAILS, {
            token: tokenWithCompleteInfo,
        })
    }, [navigation, tokenWithCompleteInfo, isVechainToken, token, isCrossChainToken])

    return (
        <BaseTouchableBox
            action={handlePress}
            py={symbol ? typography.lineHeight.body : typography.lineHeight.captionSemiBold}
            flexDirection="row"
            bg={theme.colors.card}
            innerContainerStyle={styles.root}>
            <BaseView flexDirection="row" gap={16} style={styles.leftSection}>
                <TokenImage
                    icon={token.icon}
                    isVechainToken={AddressUtils.isVechainToken(token.address)}
                    iconSize={32}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {symbol ? (
                    <BaseView flexDirection="column" flexGrow={0} flexShrink={1} style={styles.tokenInfo}>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        {symbol}
                    </BaseView>
                ) : (
                    <BaseText
                        flex={1}
                        typographyFont="subSubTitleSemiBold"
                        color={theme.colors.activityCard.title}
                        flexDirection="row"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            {shouldShowCharts && (
                <BaseView style={styles.chartContainer}>
                    <Chart token={token} />
                </BaseView>
            )}

            <BaseView flexDirection="column" alignItems="flex-end" style={styles.balanceSection}>
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
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="TOKEN_CARD_TOKEN_BALANCE">
                            {balance}
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
                        {balance}
                    </BaseText>
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            gap: 16,
            alignItems: "center",
            borderRadius: 12,
            justifyContent: "space-between",
            minHeight: 80,
        },
        leftSection: {
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
        },
        tokenInfo: {
            minWidth: 0,
        },
        chartContainer: {
            width: CHART_WIDTH,
            flexShrink: 0,
            flexGrow: 0,
            justifyContent: "center",
            alignItems: "center",
        },
        balanceSection: {
            flexGrow: 0,
            flexShrink: 0,
            minWidth: 88,
        },
    })
