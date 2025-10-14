import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, typography, VET, VOT3, VTHO } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { selectBalanceVisible, selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { Chart } from "./Chart"

type Props = {
    token: FungibleTokenWithBalance
}

export const TokenCard = ({ token }: Props) => {
    const navigation = useNavigation()
    const currency = useAppSelector(selectCurrency)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
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

    const balance = useMemo(() => {
        if (!isBalanceVisible) {
            return "••••••"
        }

        return tokenBalance
    }, [isBalanceVisible, tokenBalance])

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
                    <BaseView flexDirection="row" gap={4} overflow="hidden">
                        <BaseText
                            typographyFont="smallCaptionSemiBold"
                            numberOfLines={1}
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
                            typographyFont="smallCaptionSemiBold"
                            numberOfLines={1}
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
                            typographyFont="smallCaptionSemiBold"
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
            py={symbol ? typography.lineHeight.body : typography.lineHeight.bodySemiBold}
            flexDirection="row"
            bg={theme.colors.card}
            innerContainerStyle={styles.root}>
            <BaseView style={styles.leftSection}>
                <TokenImage
                    icon={token.icon}
                    isVechainToken={AddressUtils.isVechainToken(token.address)}
                    iconSize={32}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {symbol ? (
                    <BaseView flexDirection="column" flexGrow={0} flexShrink={1}>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            numberOfLines={1}
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        {symbol}
                    </BaseView>
                ) : (
                    <BaseText
                        flex={1}
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        flexDirection="row"
                        numberOfLines={1}>
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <Chart token={token} showChart={showChart} setShowChart={setShowChart} />

            <BaseView style={styles.rightSection}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="TOKEN_CARD_FIAT_BALANCE">
                            {fiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="captionSemiBold"
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
        },
        leftSection: {
            flexDirection: "row",
            gap: 16,
            flex: 1,
            flexShrink: 1,
            alignItems: "center",
        },
        rightSection: {
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: 80,
            flexShrink: 0,
            flexGrow: 0,
        },
    })
