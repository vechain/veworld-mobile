import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    DEFAULT_LINE_CHART_DATA,
    getCoinGeckoIdBySymbol,
    useSmartMarketChart,
    useTokenSocialLinks,
} from "~Api/Coingecko"
import { BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { LineChart } from "~Components/Reusable/LineChart"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { useThemedStyles } from "~Hooks"
import { getUseAccountTokenActivitiesQueryKey } from "~Hooks/useAccountTokenActivities"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { FetchActivitiesResponse } from "~Networking"
import { selectCurrency, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { AssetBalanceActivity } from "./Components/AssetBalanceActivity"
import { ASSET_CHART_PERIODS, AssetChart } from "./Components/AssetChart"
import { AssertChartBalance } from "./Components/AssetChartBalance"
import { AssetDetailScreenWrapper } from "./Components/AssetDetailScreenWrapper"
import ChartUtils from "~Utils/ChartUtils"
// import { AssetChartV2 } from "./Components/AssetChart/AssetChartV2"
import { AssetStats } from "./Components/AssetStats"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params

    const [selectedItem, setSelectedItem] = useState(ASSET_CHART_PERIODS[0])

    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)
    const socialLinks = useTokenSocialLinks(token.tokenInfo) ?? {}
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const qc = useQueryClient()

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])
    const name = useTokenDisplayName(token)

    const hasTokenChart = useMemo(() => SUPPORTED_CHART_TOKENS.has(token.symbol), [token.symbol])

    const {
        data: chartData,
        isLoading,
        isFetching,
        isRefetching,
    } = useSmartMarketChart({
        id: hasTokenChart ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: selectedItem.days,
    })

    const isLoadingChart = useMemo(() => isLoading || isFetching || isRefetching, [isLoading, isFetching, isRefetching])

    const downsampledChartData = useMemo(() => {
        if (!chartData) return DEFAULT_LINE_CHART_DATA

        switch (selectedItem.days) {
            case 1:
            case 7:
                return ChartUtils.downsampleData(chartData, "hour", 1, "first")
            case 30:
                return ChartUtils.downsampleData(chartData, "day", 1, "first")
            case 180:
                return ChartUtils.downsampleData(chartData, "day", 30, "first")
            case 365:
                return ChartUtils.downsampleData(chartData, "day", 52, "first")
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

    return (
        <AssetDetailScreenWrapper>
            <LineChart.Provider data={downsampledChartData} isLoading={isLoadingChart}>
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

                <AssetBalanceActivity token={token as FungibleTokenWithBalance} />
            </LineChart.Provider>
            {token.symbol && (
                <AssetStats
                    tokenSymbol={token.symbol}
                    tokenDescription={token.tokenInfo?.description?.en}
                    socialLinks={socialLinks ?? {}}
                />
            )}
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
