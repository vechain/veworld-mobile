import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { getCoinGeckoIdBySymbol, useTokenInfo } from "~Api/Coingecko"
import { MarketInfo, useFormattedMarketInfo } from "../../AssetDetailScreen/Hooks/useFormattedMarketInfo"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { COLORS, ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { Routes } from "~Navigation"
import { SocialLinksButtons } from "./SocialLinksButtons"

const DESCRIPTION_WORD_THRESHOLD = 20

type AssetStatsProps = {
    tokenSymbol: string
    tokenDescription?: string
    socialLinks?: {
        website?: string
        twitter?: string
        telegram?: string
    }
}

type StatItem = {
    label: string
    value: string | null
    testID: string
}

export const AssetStats = ({ tokenSymbol, tokenDescription, socialLinks }: AssetStatsProps): JSX.Element => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const [isAccordionOpen, setIsAccordionOpen] = useState(false)
    const { navigateWithTab } = useBrowserTab(Routes.HOME)

    const handleSocialLinkPress = useCallback(
        (url: string) => {
            navigateWithTab({ url, title: url })
        },
        [navigateWithTab],
    )

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
            px={24}
            py={24}
            mx={16}
            my={16}
            borderRadius={16}>
            <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={12}>
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
                    testID={testID}
                    py={8}>
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

            <BaseSpacer height={1} background={theme.isDark ? COLORS.PURPLE : COLORS.GREY_100} my={16} />

            {tokenDescription && (
                <>
                    <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={12}>
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
                                my={12}
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
                    <BaseSpacer height={8} />
                </>
            )}
            <SocialLinksButtons socialLinks={socialLinks} onNavigate={handleSocialLinkPress} />
        </BaseView>
    )
}

const baseStyles = (_theme: ColorThemeType) =>
    StyleSheet.create({
        toggleButton: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 8,
            gap: 4,
            width: "100%",
        },
    })
