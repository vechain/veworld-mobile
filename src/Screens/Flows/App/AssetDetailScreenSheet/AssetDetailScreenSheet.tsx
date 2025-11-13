import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { InfiniteData, usePrefetchQuery, useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    DEFAULT_LINE_CHART_DATA,
    getCoinGeckoIdBySymbol,
    getSmartMarketChartV2QueryOptions,
    useSmartMarketChartV2,
} from "~Api/Coingecko"
import { AlertInline, BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { LineChart } from "~Components/Reusable/LineChart"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { VeDelegate } from "~Constants/Constants"
import { useThemedStyles } from "~Hooks"
import { getUseAccountTokenActivitiesQueryKey } from "~Hooks/useAccountTokenActivities"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { useTokenRegistryInfo } from "~Hooks/useTokenRegistryInfo"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { FetchActivitiesResponse } from "~Networking"
import { selectCurrency, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, PlatformUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { AssetBalanceActivity } from "./Components/AssetBalanceActivity"
import { ASSET_CHART_PERIODS, AssetChart } from "./Components/AssetChart"
import { AssertChartBalance } from "./Components/AssetChartBalance"
import { AssetDetailScreenWrapper } from "./Components/AssetDetailScreenWrapper"
import { AssetStats } from "./Components/AssetStats"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params

    const [selectedItem, setSelectedItem] = useState(ASSET_CHART_PERIODS[0])

    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)
    const { description, links } = useTokenRegistryInfo(token)
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const qc = useQueryClient()
    const { LL } = useI18nContext()

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])
    const name = useTokenDisplayName(token)

    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])

    const chartId = useMemo(
        () => (hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined),
        [hasTokenChart, token.symbol],
    )

    const {
        data: chartData,
        isLoading,
        isFetching,
        isRefetching,
    } = useSmartMarketChartV2({
        id: chartId,
        vs_currency: currency,
        days: selectedItem.days,
    })

    // Prefetch all the periods

    usePrefetchQuery(
        getSmartMarketChartV2QueryOptions({
            days: ASSET_CHART_PERIODS[1].days,
            vs_currency: currency,
            id: chartId,
        }),
    )
    usePrefetchQuery(
        getSmartMarketChartV2QueryOptions({
            days: ASSET_CHART_PERIODS[2].days,
            vs_currency: currency,
            id: chartId,
        }),
    )
    usePrefetchQuery(
        getSmartMarketChartV2QueryOptions({
            days: ASSET_CHART_PERIODS[3].days,
            vs_currency: currency,
            id: chartId,
        }),
    )
    usePrefetchQuery(
        getSmartMarketChartV2QueryOptions({
            days: ASSET_CHART_PERIODS[4].days,
            vs_currency: currency,
            id: chartId,
        }),
    )

    const isLoadingChart = useMemo(() => isLoading || isFetching || isRefetching, [isLoading, isFetching, isRefetching])

    const downsampledChartData = useMemo(() => {
        if (!chartData) return DEFAULT_LINE_CHART_DATA

        switch (selectedItem.days) {
            case 1:
                return ChartUtils.downsampleData(chartData, "hour", 1, "first")
            case 7:
                return ChartUtils.downsampleData(chartData, "hour", 7, "first")
            case 30:
                return ChartUtils.downsampleData(chartData, "day", 1, "first")
            case 365:
                return ChartUtils.downsampleData(chartData, "day", 52, "first")
            case "max":
                return ChartUtils.downsampleData(chartData, "month", 1, "first")
            default:
                return chartData
        }
    }, [chartData, selectedItem.days])

    useEffect(() => {
        qc.setQueryData<InfiniteData<FetchActivitiesResponse, number>>(
            getUseAccountTokenActivitiesQueryKey(network.genesis.id, account.address, token.address),
            d => {
                if (!d?.pages?.length) return undefined
                return {
                    pages: [d.pages[0]],
                    pageParams: [d.pageParams[0]],
                }
            },
        )
    }, [account.address, network.genesis.id, qc, token.address])

    const renderFooter = useCallback(() => {
        if (token.symbol === VeDelegate.symbol) {
            return (
                <BaseView px={16}>
                    <BaseSpacer height={24} />
                    <AlertInline status="info" variant="banner" message={LL.TOKEN_DETAIL_VEDELEGATE_FOOTER_MESSAGE()} />
                    <BaseSpacer height={PlatformUtils.isAndroid() ? 24 : 40} />
                </BaseView>
            )
        }

        if (token.symbol) {
            return (
                <AssetStats
                    tokenSymbol={token.symbol}
                    tokenDescription={description}
                    links={links}
                    isWrappedToken={isCrossChainToken}
                />
            )
        }
        return <BaseSpacer height={16} />
    }, [token.symbol, description, links, isCrossChainToken, LL])

    return (
        <AssetDetailScreenWrapper>
            <LineChart.Provider data={downsampledChartData} isLoading={isLoadingChart}>
                <BaseView flexDirection="row" justifyContent="space-between" style={styles.padding} mt={8}>
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
                {hasTokenChart && token.symbol !== VeDelegate.symbol && (
                    <>
                        <AssetChart selectedPeriod={selectedItem} setSelectedPeriod={setSelectedItem} />
                        <BaseSpacer height={24} />
                    </>
                )}

                <AssetBalanceActivity token={token as FungibleTokenWithBalance} />
            </LineChart.Provider>
            {renderFooter()}
        </AssetDetailScreenWrapper>
    )
}

const baseStyles = () =>
    StyleSheet.create({
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
