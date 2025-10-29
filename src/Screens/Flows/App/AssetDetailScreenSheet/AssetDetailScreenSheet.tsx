import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { LineChart } from "react-native-wagmi-charts"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { ASSET_CHART_PERIODS, AssetChart } from "./Components/AssetChart"
import { AssertChartBalance } from "./Components/AssetChartBalance"
import { AssetDetailScreenWrapper } from "./Components/AssetDetailScreenWrapper"
import ChartUtils from "~Utils/ChartUtils"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params
    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])
    const name = useTokenDisplayName(token)

    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])

    const { data: chartData } = useSmartMarketChart({
        id: hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const [selectedItem, setSelectedItem] = useState(ASSET_CHART_PERIODS[0])

    return (
        <AssetDetailScreenWrapper>
            <LineChart.Provider
                data={ChartUtils.downsampleData(chartData ?? DEFAULT_LINE_CHART_DATA, "hour", 1, "first")!}>
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
                    {chartData?.length && <AssertChartBalance />}
                </BaseView>
                <BaseSpacer height={24} />
                {hasTokenChart && (
                    <>
                        <AssetChart selectedPeriod={selectedItem} setSelectedPeriod={setSelectedItem} />
                        <BaseSpacer height={24} />
                    </>
                )}
            </LineChart.Provider>
        </AssetDetailScreenWrapper>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            paddingBottom: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.APP_BACKGROUND_LIGHT,
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
