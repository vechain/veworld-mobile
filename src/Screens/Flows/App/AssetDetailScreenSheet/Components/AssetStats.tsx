import React, { useCallback, useMemo } from "react"
import { Linking } from "react-native"
import { getCoinGeckoIdBySymbol, useTokenInfo } from "~Api/Coingecko"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n"
import { TokenSocialLinks } from "~Model"
import { Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { MarketInfo, useFormattedMarketInfo } from "../../AssetDetailScreen/Hooks/useFormattedMarketInfo"
import { AssetDescription } from "./AssetDescription"
import { SocialLinksButtons } from "./SocialLinksButtons"

type AssetStatsProps = {
    tokenSymbol: string
    tokenDescription?: string
    links?: TokenSocialLinks
    isWrappedToken?: boolean
}

type StatItem = {
    label: string
    value: string | null
    testID: string
}

const StatRow = React.memo<StatItem & { labelColor: string; valueColor: string }>(
    ({ label, value, testID, labelColor, valueColor }) => (
        <BaseView
            flexDirection="row"
            alignItems="center"
            gap={12}
            justifyContent="space-between"
            testID={testID}
            py={8}>
            <BaseText typographyFont="smallButtonPrimary" color={labelColor}>
                {label}
            </BaseText>
            <BaseText typographyFont="smallButtonPrimary" color={valueColor} testID={`${testID}-value`}>
                {value ?? "N/A"}
            </BaseText>
        </BaseView>
    ),
)

StatRow.displayName = "StatRow"

export const AssetStats = ({ tokenSymbol, tokenDescription, links, isWrappedToken = false }: AssetStatsProps) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { navigateWithTab } = useBrowserTab(Routes.HOME)

    const handleSocialLinkPress = useCallback(
        (url: string, kind: "website" | "twitter" | "telegram") => {
            if (kind === "website") {
                navigateWithTab({ url, title: url })
                return
            }
            Linking.openURL(url)
        },
        [navigateWithTab],
    )

    const currency = useAppSelector(selectCurrency)

    // Only fetch CoinGecko token info for non-wrapped tokens
    const shouldFetchTokenInfo = !isWrappedToken && !!getCoinGeckoIdBySymbol[tokenSymbol]

    const { data: tokenInfo } = useTokenInfo({
        id: shouldFetchTokenInfo ? getCoinGeckoIdBySymbol[tokenSymbol] : undefined,
    })

    const marketInfo: MarketInfo | undefined = useMemo(() => {
        if (!tokenInfo) return undefined
        return {
            marketCap: tokenInfo?.market_data?.market_cap[currency.toLowerCase()],
            totalSupply: tokenInfo?.market_data?.total_supply,
            totalVolume: tokenInfo?.market_data?.total_volume[currency.toLowerCase()],
            circulatingSupply: tokenInfo?.market_data?.circulating_supply,
            high24h: tokenInfo?.market_data?.high_24h[currency.toLowerCase()],
            low24h: tokenInfo?.market_data?.low_24h[currency.toLowerCase()],
        }
    }, [tokenInfo, currency])

    const { marketCap, totalSupply, totalVolume, circulatingSupply, high24h, low24h } = useFormattedMarketInfo({
        marketInfo,
    })

    const stats: StatItem[] = useMemo(
        () => [
            { label: LL.COMMON_MARKET_CAP(), value: marketCap, testID: "stat-market-cap" },
            { label: LL.COMMON_CIRCULATING_SUPPLY(), value: circulatingSupply, testID: "stat-circulating-supply" },
            { label: LL.COMMON_TOTAL_SUPPLY(), value: totalSupply, testID: "stat-total-supply" },
            { label: LL.COMMON_24H_VOLUME(), value: totalVolume, testID: "stat-24h-volume" },
            { label: LL.COMMON_24H_PRICE_RANGE(), value: `${low24h} - ${high24h}`, testID: "stat-24h-range" },
        ],
        [LL, marketCap, circulatingSupply, totalSupply, totalVolume, high24h, low24h],
    )

    const shouldShowStats = useMemo(() => {
        if (isWrappedToken) return false
        if (!marketInfo) return false
        return true
    }, [isWrappedToken, marketInfo])

    return (
        <BaseView
            bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_50}
            px={24}
            py={24}
            mx={16}
            my={16}
            borderRadius={16}>
            {shouldShowStats && (
                <>
                    <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={12}>
                        <BaseIcon name="icon-line-chart" size={20} color={theme.colors.actionBanner.title} />
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.actionBanner.title}>
                            {LL.COMMON_TOKEN_STATS()}
                        </BaseText>
                    </BaseView>

                    {stats.map(stat => (
                        <StatRow
                            key={stat.testID}
                            {...stat}
                            labelColor={theme.colors.textLightish}
                            valueColor={theme.colors.x2eAppOpenDetails.stats.value}
                        />
                    ))}

                    <BaseSpacer height={1} background={theme.isDark ? COLORS.PURPLE : COLORS.GREY_100} my={16} />
                </>
            )}

            <AssetDescription description={tokenDescription} />
            <SocialLinksButtons links={links} onNavigate={handleSocialLinkPress} />
        </BaseView>
    )
}
