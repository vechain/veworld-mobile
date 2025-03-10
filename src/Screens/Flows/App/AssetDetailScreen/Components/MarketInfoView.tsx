import React, { useMemo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { MarketInfo, useFormattedMarketInfo } from "../Hooks/useFormattedMarketInfo"
import { getCoinGeckoIdBySymbol, useTokenInfo } from "~Api/Coingecko"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

export const MarketInfoView = ({ tokenSymbol }: { tokenSymbol: string }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const currency = useAppSelector(selectCurrency)

    const { data: tokenInfo } = useTokenInfo({
        id: getCoinGeckoIdBySymbol[tokenSymbol],
    })

    const marketInfo: MarketInfo | undefined = useMemo(() => {
        if (!tokenInfo) return undefined
        return {
            marketCap: tokenInfo?.market_data?.market_cap[currency.toLowerCase()],
            totalSupply: tokenInfo?.market_data?.total_supply,
            totalVolume: tokenInfo?.market_data?.total_volume[currency.toLowerCase()],
            circulatingSupply: tokenInfo?.market_data?.circulating_supply,
        }
    }, [tokenInfo, currency])

    const { marketCap, totalSupply, totalVolume, circulatingSupply } = useFormattedMarketInfo({
        marketInfo,
    })

    return (
        <BaseView>
            <BaseView flexDirection="row" flexWrap="wrap" style={styles.container}>
                <BaseView w={50} p={12} style={styles.borderMarketCap}>
                    <BaseText typographyFont="captionRegular">{LL.COMMON_MARKET_CAP()}</BaseText>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="captionBold" py={4} numberOfLines={1}>
                            {marketCap ?? "N/A"}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderTotalSupply}>
                    <BaseText typographyFont="captionRegular">{LL.COMMON_TOTAL_SUPPLY()}</BaseText>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="captionBold" py={4} numberOfLines={1}>
                            {totalSupply ?? "N/A"}
                        </BaseText>
                        {!!totalSupply && (
                            <>
                                <BaseSpacer width={4} />
                                <BaseText typographyFont="captionBold">{tokenSymbol}</BaseText>
                            </>
                        )}
                    </BaseView>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderTotalVolume}>
                    <BaseText typographyFont="captionRegular">{LL.COMMON_24H_VOLUME()}</BaseText>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="captionBold" py={4} numberOfLines={1}>
                            {totalVolume ?? "N/A"}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderCirculatingSupply}>
                    <BaseText typographyFont="captionRegular">{LL.COMMON_CIRCULATING_SUPPLY()}</BaseText>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="captionBold" py={4} numberOfLines={1}>
                            {circulatingSupply ?? "N/A"}
                        </BaseText>
                        {!!circulatingSupply && (
                            <>
                                <BaseSpacer width={4} />
                                <BaseText typographyFont="captionBold">{tokenSymbol}</BaseText>
                            </>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: theme.colors.marketInfoBackground,
        },
        borderMarketCap: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
            borderRightWidth: 1,
            borderRightColor: theme.colors.background,
        },
        borderTotalSupply: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.background,
        },
        borderTotalVolume: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.background,
            borderRightWidth: 1,
            borderRightColor: theme.colors.background,
        },
        borderCirculatingSupply: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.background,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.background,
        },
    })
