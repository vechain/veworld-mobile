import { ethers } from "ethers"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import Markdown from "react-native-markdown-display"
import { StargateDappBannerB3MO, StargateLogo } from "~Assets"
import { BaseButton, BaseIcon, BaseSpacer, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useBrowserNavigation } from "~Hooks/useBrowserSearch"
import { useStargateStats } from "~Hooks/useStargateStats"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { StargateStatsCard } from "./StargateStatsCard"
import FontUtils from "~Utils/FontUtils"

export const StargateNoStakingCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()
    const { navigateToBrowser } = useBrowserNavigation()

    const { data: stargateStats } = useStargateStats()

    const formattedStargateStats = useMemo(() => {
        return {
            totalSupply: BigNutils(stargateStats?.totalSupply?.total ?? "0").toCompactString(formatLocale, 1) ?? "0",
            totalVetStaked:
                BigNutils(ethers.utils.formatEther(stargateStats?.totalVetStaked?.total ?? "0")).toCompactString(
                    formatLocale,
                    1,
                ) ?? "0",
            rewardsDistributed:
                BigNutils(ethers.utils.formatEther(stargateStats?.rewardsDistributed ?? "0")).toCompactString(
                    formatLocale,
                    1,
                ) ?? "0",
            vthoPerDay: BigNutils(stargateStats?.vthoPerDay ?? "0").toCompactString(formatLocale, 1) ?? "0",
        }
    }, [
        stargateStats?.totalSupply?.total,
        stargateStats?.totalVetStaked?.total,
        stargateStats?.rewardsDistributed,
        stargateStats?.vthoPerDay,
        formatLocale,
    ])

    return (
        <BaseView style={styles.root} testID="STARGATE_NO_STAKING_CARD">
            <BaseView style={styles.b3mo}>
                <FastImage
                    source={StargateDappBannerB3MO}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.b3moImage as ImageStyle}
                />
            </BaseView>
            <BaseView flexDirection="column" gap={24} w={50}>
                <StargateLogo color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} width={129} height={24} />
                <Markdown
                    style={{
                        paragraph: styles.paragraph,
                        body: styles.text,
                        strong: isAndroid() ? styles.strongAndroid : styles.strongIOS,
                    }}>
                    {LL.STARGATE_STAT_DESCRIPTION()}
                </Markdown>
            </BaseView>

            <BaseSpacer height={32} />

            <BaseView w={100} flexDirection="column" gap={8} flex={1}>
                <BaseView flexDirection="row" gap={8} flex={1}>
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_TOTAL_SUPPLY()}
                        parsedValue={formattedStargateStats.totalSupply}
                        unit="NFTs"
                    />
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_TOTAL_STAKED()}
                        parsedValue={formattedStargateStats.totalVetStaked}
                        unit="VET"
                    />
                </BaseView>
                <BaseView flexDirection="row" gap={8} flex={1}>
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_REWARDS_GENERATION()}
                        parsedValue={formattedStargateStats.vthoPerDay}
                        unit={`VTHO/${LL.COMMOMN_DAY()}`}
                    />
                    <StargateStatsCard
                        title={LL.STARGATE_STAT_REWARDS_DISTRIBUTED()}
                        parsedValue={formattedStargateStats.rewardsDistributed}
                        unit="VTHO"
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseButton
                testID="STARGATE_START_STAKING_BUTTON"
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
        strongIOS: {
            fontWeight: "600",
            fontFamily: "Inter-SemiBold",
        },
        strongAndroid: {
            fontWeight: "700",
            fontFamily: "Inter-Bold",
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 0,
        },
        text: {
            fontSize: FontUtils.font(14),
            flex: 1,
            fontFamily: "Inter-Regular",
            lineHeight: 20,
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500,
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
