import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { StargateDappBannerB3MO, StargateLogo } from "~Assets"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useBrowserNavigation, useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { StargateStatsCard } from "./StargateStatsCard"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import Markdown from "react-native-markdown-display"
import { useStargateStats } from "~Hooks/useStargateStats"
import { BigNutils } from "~Utils"
import { ethers } from "ethers"

export const StargateNoStakingCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()
    const { navigateToBrowser } = useBrowserNavigation()

    const { data: stargateStats } = useStargateStats()

    const formattedTotalVetStaked = useMemo(() => {
        return (
            BigNutils(ethers.utils.formatEther(stargateStats?.totalVetStaked?.total ?? "0")).toCompactString(
                formatLocale,
                1,
            ) ?? "0"
        )
    }, [stargateStats?.totalVetStaked?.total, formatLocale])

    const formattedRewardsDistributed = useMemo(() => {
        return (
            BigNutils(ethers.utils.formatEther(stargateStats?.rewardsDistributed ?? "0")).toCompactString(
                formatLocale,
                1,
            ) ?? "0"
        )
    }, [stargateStats?.rewardsDistributed, formatLocale])

    const formattedTotalSupply = useMemo(() => {
        return BigNutils(stargateStats?.totalSupply?.total ?? "0").toCompactString(formatLocale, 1) ?? "0"
    }, [stargateStats?.totalSupply?.total, formatLocale])

    const formattedVthoPerDay = useMemo(() => {
        return BigNutils(stargateStats?.vthoPerDay ?? "0").toCompactString(formatLocale, 1) ?? "0"
    }, [stargateStats?.vthoPerDay, formatLocale])

    return (
        <BaseView style={styles.root}>
            <BaseView style={styles.b3mo}>
                <FastImage
                    source={StargateDappBannerB3MO}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.b3moImage as ImageStyle}
                />
            </BaseView>
            <BaseView flexDirection="column" gap={24} w={55}>
                <StargateLogo color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} width={129} height={24} />
                <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="body">
                    <Markdown
                        style={{
                            body: styles.text,
                            strong: isAndroid() ? styles.strongAndroid : styles.strongIOS,
                        }}>
                        {LL.STARGATE_STAT_DESCRIPTION()}
                    </Markdown>
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseView w={100} flexDirection="column" gap={8}>
                <BaseView flexDirection="row" gap={8}>
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_TOTAL_SUPPLY()}
                        parsedValue={formattedTotalSupply}
                        unit="NFTs"
                    />
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_TOTAL_STAKED()}
                        parsedValue={formattedTotalVetStaked}
                        unit="VET"
                    />
                </BaseView>
                <BaseView flexDirection="row" gap={8}>
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_REWARDS_GENERATION()}
                        parsedValue={formattedVthoPerDay}
                        unit={`VTHO/${LL.COMMOMN_DAY()}`}
                    />
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_REWARDS_DISTRIBUTED()}
                        parsedValue={formattedRewardsDistributed}
                        unit="VTHO"
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseButton
                action={() => {
                    navigateToBrowser(STARGATE_DAPP_URL_HOME_BANNER)
                }}
                variant="solid"
                rightIcon={
                    <BaseIcon
                        name="icon-arrow-right"
                        color={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                        size={20}
                    />
                }
                typographyFont="bodySemiBold"
                w={100}
                style={styles.button}
                textColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
                bgColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                selfAlign="center">
                {LL.STARGATE_START_STAKING()}
            </BaseButton>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 40,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        strongIOS: {
            fontWeight: "600",
            fontFamily: "Inter-SemiBold",
        },
        strongAndroid: {
            fontWeight: "700",
            fontFamily: "Inter-Bold",
        },
        text: {
            fontSize: 16,
            fontFamily: "Inter-Regular",
            lineHeight: 24,
            color: theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500,
        },
        b3mo: {
            position: "absolute",
            right: -24,
            top: 16,
            width: 196,
            height: 196,
        },
        b3moImage: {
            width: "100%",
            height: "100%",
        },
        button: {
            justifyContent: "center",
            gap: 12,
        },
    })
