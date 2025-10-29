import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks/useTheme"
import { getCoinGeckoIdBySymbol, useTokenInfo } from "~Api/Coingecko"
import { MarketInfo, useFormattedMarketInfo } from "../../AssetDetailScreen/Hooks/useFormattedMarketInfo"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const DESCRIPTION_WORD_THRESHOLD = 20

type AssetStatsProps = {
    tokenSymbol: string
    tokenDescription?: string
}

type StatItem = {
    label: string
    value: string | null
    testID: string
}

export const AssetStats = ({ tokenSymbol, tokenDescription }: AssetStatsProps): JSX.Element => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const [isAccordionOpen, setIsAccordionOpen] = useState(false)

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

    const shouldShowAccordion = useMemo(() => {
        if (!tokenDescription) return false
        const wordCount = tokenDescription.trim().split(/\s+/).length
        return wordCount > DESCRIPTION_WORD_THRESHOLD
    }, [tokenDescription])

    const open = useSharedValue(false)
    const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)))

    const chevronStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 180}deg` }],
        }
    }, [])

    const handleToggle = useCallback(() => {
        setIsAccordionOpen(prev => !prev)
        open.value = !open.value
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // open is a stable SharedValue ref, doesn't need to be in deps

    return (
        <BaseView
            bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_50}
            px={16}
            py={24}
            mx={16}
            my={16}
            borderRadius={16}
            gap={16}>
            <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={8}>
                <BaseIcon name="icon-line-chart" size={20} color={theme.colors.actionBanner.title} />
                <BaseText typographyFont="bodySemiBold" color={theme.colors.actionBanner.title}>
                    {LL.COMMON_TOKEN_STATS()}
                </BaseText>
            </BaseView>

            {stats.map(({ label, value, testID }) => (
                <BaseView
                    key={testID}
                    flexDirection="row"
                    alignItems="center"
                    gap={12}
                    justifyContent="space-between"
                    testID={testID}>
                    <BaseText typographyFont="smallButtonPrimary" color={theme.colors.textLightish}>
                        {label}
                    </BaseText>
                    <BaseText
                        typographyFont="smallButtonPrimary"
                        color={theme.colors.x2eAppOpenDetails.stats.value}
                        testID={`${testID}-value`}>
                        {value ?? "N/A"}
                    </BaseText>
                </BaseView>
            ))}

            {tokenDescription && (
                <>
                    <BaseSpacer height={1} background={theme.isDark ? COLORS.PURPLE : COLORS.GREY_100} my={8} />
                    <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={8}>
                        <BaseIcon name="icon-alert-circle" size={20} color={theme.colors.actionBanner.title} />
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.actionBanner.title}>
                            {LL.TITLE_ABOUT()}
                        </BaseText>
                    </BaseView>

                    {shouldShowAccordion ? (
                        <>
                            <BaseText
                                typographyFont="smallButtonPrimary"
                                color={theme.colors.textLightish}
                                numberOfLines={isAccordionOpen ? undefined : 3}
                                testID="token-description">
                                {tokenDescription}
                            </BaseText>
                            <BaseView
                                onStartShouldSetResponder={() => true}
                                onTouchEnd={e => {
                                    e.stopPropagation()
                                }}>
                                <Pressable onPress={handleToggle} style={styles.toggleButton} testID="read-more-toggle">
                                    <BaseText
                                        typographyFont="smallButtonPrimary"
                                        color={theme.colors.actionBanner.title}>
                                        {isAccordionOpen ? LL.COMMON_LBL_READ_LESS() : LL.COMMON_LBL_READ_MORE()}
                                    </BaseText>
                                    <Animated.View style={chevronStyle}>
                                        <BaseIcon
                                            name="icon-chevron-down"
                                            color={theme.colors.actionBanner.title}
                                            size={14}
                                            testID="chevron"
                                        />
                                    </Animated.View>
                                </Pressable>
                            </BaseView>
                        </>
                    ) : (
                        <BaseText
                            typographyFont="smallButtonPrimary"
                            color={theme.colors.textLightish}
                            testID="token-description">
                            {tokenDescription}
                        </BaseText>
                    )}
                </>
            )}
        </BaseView>
    )
}

const styles = StyleSheet.create({
    toggleButton: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 8,
        gap: 4,
        width: "100%",
    },
})
