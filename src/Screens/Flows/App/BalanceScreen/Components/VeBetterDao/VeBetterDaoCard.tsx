import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { b3mo, b3tr3D } from "~Assets"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useUserVeBetterStats } from "~Hooks/useUserVeBetterStats"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"
import { StatsCard } from "./StatsCard"

export const VeBetterDaoCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { data } = useUserVeBetterStats()
    const { formatLocale } = useFormatFiat()

    const stats = useMemo(() => {
        if (!data) return { co2: 0, water: 0, trees: 0 }
        return {
            co2: data.totalImpact.carbon,
            water: data.totalImpact.water,
            trees: data.totalImpact.trees_planted,
        }
    }, [data])

    return (
        <BaseView style={styles.root}>
            <FastImage source={b3mo} style={styles.b3mo as ImageStyle} />
            <BaseView pl={16} pb={16} flexDirection="column" gap={8}>
                <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodySemiBold">
                    {LL.VBD_YOUR_BETTER_ACTIONS()}
                </BaseText>
                <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.GREY_700} style={styles.actionsText}>
                    {BigNutils(data?.actionsRewarded ?? "0").toCurrencyFormat_string(0, formatLocale)}
                </BaseText>
            </BaseView>

            <BaseView w={100} flexDirection="row" gap={8}>
                <StatsCard label="co2" value={stats.co2} />
                <StatsCard label="water" value={stats.water} />
                <StatsCard label="trees" value={stats.trees} />
            </BaseView>

            <BaseView pt={16} px={24} pb={8} gap={8} flexDirection="column" style={styles.rewards}>
                <FastImage source={b3tr3D} style={styles.b3tr3D as ImageStyle} />
                <BaseView flexDirection="row" gap={8}>
                    <BaseIcon name="icon-gift" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} size={16} />
                    <BaseText color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} typographyFont="bodySemiBold">
                        {LL.VBD_REWARDS_EARNED()}
                    </BaseText>
                </BaseView>
                <BaseView flexDirection="column">
                    <BaseView py={4} flexDirection="row" justifyContent="space-between">
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            typographyFont="captionMedium">
                            {LL.THIS_WEEK()}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                                typographyFont="captionSemiBold">
                                {BigNutils(data?.week ?? "0").toTokenFormatFull_string(2, formatLocale)}
                            </BaseText>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                typographyFont="smallCaptionMedium">
                                {B3TR.symbol}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseView py={4} flexDirection="row" justifyContent="space-between">
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            typographyFont="captionMedium">
                            {LL.THIS_MONTH()}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                                typographyFont="captionSemiBold">
                                {BigNutils(data?.month ?? "0").toTokenFormatFull_string(2, formatLocale)}
                            </BaseText>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                typographyFont="smallCaptionMedium">
                                {B3TR.symbol}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseSpacer height={1} width={"100%"} background="rgba(185, 181, 207, 0.15)" />
                <BaseView py={6} flexDirection="row" justifyContent="space-between">
                    <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700} typographyFont="bodyMedium">
                        {LL.TOTAL()}
                    </BaseText>
                    <BaseView flexDirection="row" gap={8}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="bodySemiBold">
                            {BigNutils(data?.totalRewardAmount ?? "0").toTokenFormatFull_string(2, formatLocale)}
                        </BaseText>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            typographyFont="captionMedium">
                            {B3TR.symbol}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>

            <BaseButton
                action={() => {}}
                variant="ghost"
                rightIcon={<BaseIcon name="icon-arrow-link" color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE} />}
                typographyFont="bodyMedium"
                textColor={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}
                selfAlign="center"
                py={0}>
                {LL.VBD_SEE_PROFILE()}
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
            gap: 24,
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 36,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        b3mo: {
            position: "absolute",
            right: -24,
            top: 8,
            width: 196,
            height: 196,
        },
        b3tr3D: {
            position: "absolute",
            right: -20,
            top: -20,
            width: 68,
            height: 68,
        },
        rewards: {
            position: "relative",
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.65)" : theme.colors.transparent,
        },
    })
