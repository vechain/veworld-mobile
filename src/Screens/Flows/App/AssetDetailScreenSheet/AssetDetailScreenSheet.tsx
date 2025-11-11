import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { LineChart } from "react-native-wagmi-charts"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { useThemedStyles } from "~Hooks"
import { getUseAccountTokenActivitiesQueryKey } from "~Hooks/useAccountTokenActivities"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { useTokenRegistryInfo } from "~Hooks/useTokenRegistryInfo"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { FetchActivitiesResponse } from "~Networking"
import { selectCurrency, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { AssetBalanceActivity } from "./Components/AssetBalanceActivity"
import { ASSET_CHART_PERIODS, AssetChart } from "./Components/AssetChart"
import { AssertChartBalance } from "./Components/AssetChartBalance"
import { AssetDetailScreenWrapper } from "./Components/AssetDetailScreenWrapper"
import { AssetStats } from "./Components/AssetStats"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params
    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)
    const { description, links } = useTokenRegistryInfo(token)
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const qc = useQueryClient()

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
            <LineChart.Provider data={chartData ?? DEFAULT_LINE_CHART_DATA}>
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
                        <AssetChart
                            data={chartData}
                            selectedPeriod={selectedItem}
                            setSelectedPeriod={setSelectedItem}
                        />
                        <BaseSpacer height={24} />
                    </>
                )}

                <AssetBalanceActivity token={token as FungibleTokenWithBalance} />
            </LineChart.Provider>
            {token.symbol && (
                <AssetStats
                    tokenSymbol={token.symbol}
                    tokenDescription={description}
                    links={links}
                    isWrappedToken={isCrossChainToken}
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
