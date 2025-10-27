import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseIcon, BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType, getNumberFormatter } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { ASSET_CHART_PERIODS, AssetChart } from "./Components/AssetChart"
import { AssetDetailScreenWrapper } from "./Components/AssetDetailScreenWrapper"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params
    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])
    const name = useTokenDisplayName(token)

    const { formatLocale } = useFormatFiat()

    const { renderFiatBalance, showFiatBalance } = useTokenCardBalance({
        token: token as FungibleTokenWithBalance,
    })

    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])

    const { data: chartData } = useSmartMarketChart({
        id: hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])
    const percentageChange = useMemo(() => ChartUtils.getPercentagePriceChange(chartData), [chartData])

    const [selectedItem, setSelectedItem] = useState(ASSET_CHART_PERIODS[0])

    return (
        <AssetDetailScreenWrapper>
            <BaseView flexDirection="row" justifyContent="space-between" style={styles.padding}>
                <BaseView flexDirection="row" gap={16}>
                    <TokenImage
                        icon={token.icon}
                        isVechainToken={AddressUtils.isVechainToken(token.address)}
                        iconSize={32}
                        isCrossChainToken={isCrossChainToken}
                        rounded={!isCrossChainToken}
                    />
                    <BaseView flexDirection="column" gap={2}>
                        <BaseText
                            typographyFont="subTitleSemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            testID="ASSET_DETAIL_SCREEN_NAME"
                            lineHeight={28}>
                            {name}
                        </BaseText>
                        <TokenSymbol token={token} typographyFont="bodySemiBold" />
                    </BaseView>
                </BaseView>
                {showFiatBalance && (
                    <BaseView flexDirection="column" alignItems="flex-end">
                        <BaseText
                            typographyFont="subTitleSemiBold"
                            color={theme.colors.activityCard.title}
                            align="right"
                            numberOfLines={1}
                            flexDirection="row"
                            testID="ASSET_DETAIL_SCREEN_FIAT_BALANCE"
                            lineHeight={28}>
                            {renderFiatBalance({ decimals: 5 })}
                        </BaseText>
                        <BaseView flexDirection="row" gap={2}>
                            <BaseIcon
                                name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                                size={16}
                                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                                testID="ASSET_DETAIL_SCREEN_CHART_ICON"
                            />
                            <BaseText
                                typographyFont="bodySemiBold"
                                color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                                align="right"
                                testID="ASSET_DETAIL_SCREEN_FIAT_BALANCE">
                                {getNumberFormatter({
                                    locale: formatLocale,
                                    precision: 2,
                                    style: "decimal",
                                    useGrouping: true,
                                }).format(percentageChange)}
                                %
                            </BaseText>
                        </BaseView>
                    </BaseView>
                )}
            </BaseView>
            <BaseSpacer height={24} />
            {hasTokenChart && (
                <>
                    <AssetChart data={chartData} selectedPeriod={selectedItem} setSelectedPeriod={setSelectedItem} />
                    <BaseSpacer height={24} />
                </>
            )}
        </AssetDetailScreenWrapper>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            paddingBottom: 16,
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
        },
        padding: {
            paddingHorizontal: 16,
        },
        margin: {
            marginHorizontal: 16,
        },
        safeArea: {
            justifyContent: "flex-end",
        },
        wrapper: {
            position: "absolute",
            left: 0,
            bottom: 0,
        },
    })
